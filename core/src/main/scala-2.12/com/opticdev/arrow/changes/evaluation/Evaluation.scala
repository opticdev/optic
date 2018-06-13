package com.opticdev.arrow.changes.evaluation

import better.files.File
import com.opticdev.arrow.changes._
import com.opticdev.arrow.changes.location.EndOfFile
import com.opticdev.arrow.state.NodeKeyStore
import com.opticdev.core.sourcegear.annotations.{AnnotationRenderer, SourceAnnotation}
import com.opticdev.core.sourcegear.{Mutate, Render, SourceGear}
import com.opticdev.core.sourcegear.project.{OpticProject, ProjectBase}
import com.opticdev.core.sourcegear.project.monitoring.FileStateMonitor
import com.opticdev.marvin.common.helpers.LineOperations
import com.opticdev.sdk.{VariableMapping, variableMappingFormat}
import com.opticdev.sdk.descriptions.transformation.{MultiTransform, TransformationResult}
import play.api.libs.json.{JsObject, Json}

import scala.util.{Failure, Success, Try}
import com.opticdev.core.sourcegear.context.SDKObjectsResolvedImplicits._
import com.opticdev.core.sourcegear.mutate.MutationSteps.{collectFieldChanges, combineChanges, handleChanges}
import com.opticdev.core.sourcegear.mutate.MutationImplicits._
import com.opticdev.core.utils.StringUtils
import com.opticdev.sdk.descriptions.Schema
import com.opticdev.sdk.descriptions.transformation.generate.{GenerateResult, RenderOptions, StagedNode}
import com.opticdev.sdk.descriptions.transformation.mutate.MutateResult
object Evaluation {

  def forChange(opticChange: OpticChange, sourcegear: SourceGear, projectOption: Option[ProjectBase] = None)(implicit filesStateMonitor: FileStateMonitor, nodeKeyStore: NodeKeyStore): ChangeResult = opticChange match {
    case im: InsertModel => {

      val stagedNode = StagedNode(im.schema.schemaRef, im.value, Some(RenderOptions(
        lensId = im.lensId
      )))

      val renderedTry = Render.fromStagedNode(stagedNode)(sourcegear)
      renderedTry.failed.foreach(_.printStackTrace)
      require(renderedTry.isSuccess, "Could not render model "+ renderedTry.failed.get.toString)
      val generatedNode = (renderedTry.get._1, renderedTry.get._2)
      val resolvedLocation = im.atLocation.get.resolveToLocation(sourcegear).get
      val changeResult = InsertCode.atLocation(generatedNode, resolvedLocation)
      if (changeResult.isSuccess) {
        changeResult.asFileChanged.stageContentsIn(filesStateMonitor)
      }

      changeResult
    }
    case rt: RunTransformation => {

      val schema = {
        if (rt.transformationChanges.transformation.isGenerateTransform) {
          sourcegear.findSchema(rt.transformationChanges.transformation.resolvedOutput(sourcegear).get).get
        } else {
          sourcegear.findSchema(rt.transformationChanges.transformation.resolvedInput(sourcegear)).get
        }
      }

      require(rt.inputValue.isDefined, "Transformation must have an input value specified")

      val transformationTry = rt.transformationChanges.transformation.transformFunction.transform(rt.inputValue.get, rt.answers.getOrElse(JsObject.empty), sourcegear.transformationCaller, rt.inputModelId)
      require(transformationTry.isSuccess, "Transformation script encountered error "+ transformationTry.failed)

      val prefixedFlatContent = sourcegear.flatContext.prefix(rt.transformationChanges.transformation.packageId.packageId)

      def generateNode(generateResult: GenerateResult, schema: Schema, lensIdOption: Option[String], topLevel: Boolean = false) : IntermediateTransformPatch = {
        val stagedNode = generateResult.toStagedNode(Some(RenderOptions(
          lensId = lensIdOption
        )))

        val report = schema.validationReport(stagedNode.value)

        require(schema.validate(stagedNode.value), "Result of transformation did not conform to schema "+ schema.schemaRef.full)

        val inputVariableMapping = Try((rt.inputValue.get \ "_variables").toOption.map(Json.fromJson[VariableMapping]).map(_.get).get)
          .getOrElse(Map.empty)

        val generatedNode = Render.fromStagedNode(stagedNode, inputVariableMapping)(sourcegear, prefixedFlatContent).get

        val updatedString = if (rt.objectSelection.isDefined) {
          val objName = rt.objectSelection.get
          AnnotationRenderer.renderToFirstLine(
            generatedNode._3.renderer.parser.get.inlineCommentPrefix,
            Vector(SourceAnnotation(objName, rt.transformationChanges.transformation.transformationRef, rt.answers)),
            generatedNode._2)
        } else generatedNode._2

        val resolvedLocation = rt.location.get.resolveToLocation(sourcegear, Some(stagedNode)).get
        val changeResult = InsertCode.atLocation((generatedNode._1, updatedString), resolvedLocation).asFileChanged
        IntermediateTransformPatch(changeResult.file, changeResult.patchInfo.get.range, changeResult.patchInfo.get.updated)
      }

      def mutateNode(mutateResult: MutateResult) : IntermediateTransformPatch = {
        implicit val context = sourcegear.flatContext.prefix(rt.transformationChanges.transformation.packageId.packageId)
        val stagedMutation = mutateResult.toStagedMutation
        val mutated = Mutate.fromStagedMutationWithoutSGContext(stagedMutation)(projectOption.get.asInstanceOf[OpticProject], nodeKeyStore, context)
        require(mutated.isSuccess, s"Failed to mutate node "+mutated.failed.get.getMessage)

        val linkedModelNode = mutated.get._4

        val file = linkedModelNode.fileNode.get.toFile
        val fileContents = filesStateMonitor.contentsForFile(file).get

        IntermediateTransformPatch(file, linkedModelNode.root.range, mutated.get._2)
      }

      transformationTry.get match {
        case x if x.yieldsGeneration => {
          val intermediateTransformPatch = generateNode(transformationTry.get.asInstanceOf[GenerateResult], schema, rt.lensId, topLevel = true)
          val fileContents = filesStateMonitor.contentsForFile(intermediateTransformPatch.file).get
          val changes = FileChanged(intermediateTransformPatch.file, StringUtils.replaceRange(fileContents, intermediateTransformPatch.range, intermediateTransformPatch.newContents))
          changes.stageContentsIn(filesStateMonitor)
          changes
        }
        case x if x.yieldsMutation => {
          val intermediateTransformPatch = mutateNode(transformationTry.get.asInstanceOf[MutateResult])
          val fileContents = filesStateMonitor.contentsForFile(intermediateTransformPatch.file).get
          val changes = FileChanged(intermediateTransformPatch.file, StringUtils.replaceRange(fileContents, intermediateTransformPatch.range, intermediateTransformPatch.newContents))
          changes.stageContentsIn(filesStateMonitor)
          changes
        }

        case multiTransform:MultiTransform => {
          val changes = MultiTransformEvaluation.apply(multiTransform, rt.location.get, mutateNode, generateNode, sourcegear)
          changes.fileChanges.foreach(_.stageContentsIn(filesStateMonitor))
          changes
        }
      }

    }
    case pu: PutUpdate => {
      val changeResult : ChangeResult = Try {
        val modelNode = nodeKeyStore.lookupId(pu.id).get
        implicit val project = projectOption.get
        implicit val actorCluster = project.actorCluster
        implicit val sourceGearContext = modelNode.getContext.get
        val file = modelNode.fileNode.get.toFile
        implicit val fileContents = filesStateMonitor.contentsForFile(file).get
        import com.opticdev.core.sourcegear.mutate.MutationImplicits._
        val output = modelNode.update(pu.newModel)
        FileChanged(file, output)
      } match {
        case s: Success[FileChanged] => s.get
        case Failure(ex) => FailedToChange(ex)
      }

      if (changeResult.isSuccess) {
        changeResult.asFileChanged.stageContentsIn(filesStateMonitor)
      }

      changeResult
    }

    case fileContentsUpdate: FileContentsUpdate => {

      val changeResult = Try {
        require(fileContentsUpdate.file.exists, s"File '${fileContentsUpdate.file}' to update must exist")
        val currentContents = filesStateMonitor.contentsForFile(fileContentsUpdate.file).get
        require(currentContents == fileContentsUpdate.originalFileContents, s"The contents of File '${fileContentsUpdate.file}' have changed since patch was generated. Aborted Patch.")
        FileChanged(fileContentsUpdate.file, fileContentsUpdate.newFileContents)
      } match {
        case s: Success[FileChanged] => s.get
        case Failure(ex) => FailedToChange(ex)
      }

      if (changeResult.isSuccess) {
        changeResult.asFileChanged.stageContentsIn(filesStateMonitor)
      }

      changeResult
    }

    //cleanup
    case cSL: ClearSearchLines => {
      val fileContentsOption = filesStateMonitor.contentsForFile(cSL.file)
      if (fileContentsOption.isSuccess) {
        val lines = fileContentsOption.get.linesWithSeparators.toVector
        val searchIndices = lines.zipWithIndex.filter(i=> cSL.regex.findFirstIn(i._1).nonEmpty ).map(_._2).reverse

        val newLines = searchIndices.foldLeft(lines) {
          case (lines, i) => lines.patch(i, Seq("\n"), 1) //replace with empty line
        }

        val changeResult = FileChanged(cSL.file, newLines.mkString)

        if (changeResult.isSuccess) {
          changeResult.asFileChanged.stageContentsIn(filesStateMonitor)
        }

        changeResult

      } else {
        NoChanges
      }
    }
  }

  def forChangeGroup(changeGroup: ChangeGroup, sourcegear: SourceGear, project: Option[OpticProject] = None)(implicit nodeKeyStore: NodeKeyStore) = {

    implicit val filesStateMonitor : FileStateMonitor = {
      //hook up to existing in-memory representation of files
      if (project.isDefined) new FileStateMonitor(project.get.filesStateMonitor) else new FileStateMonitor
    }

    val results = changeGroup.changes.map(c=> forChange(c, sourcegear, project))

    BatchedChanges(results, filesStateMonitor.allStaged)
  }

}