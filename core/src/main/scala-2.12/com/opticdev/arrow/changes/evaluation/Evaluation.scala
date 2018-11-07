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
import play.api.libs.json.{JsObject, JsString, Json}

import scala.util.{Failure, Success, Try}
import com.opticdev.core.sourcegear.context.SDKObjectsResolvedImplicits._
import com.opticdev.core.sourcegear.graph.model.{LinkedModelNode, MultiModelNode}
import com.opticdev.core.sourcegear.mutate.MutationSteps.{collectFieldChanges, combineChanges, handleChanges}
import com.opticdev.core.sourcegear.mutate.MutationImplicits._
import com.opticdev.core.utils.StringUtils
import com.opticdev.common.graph.CommonAstNode
import com.opticdev.sdk.descriptions.transformation.generate.{GenerateResult, RenderOptions, StagedNode}
import com.opticdev.sdk.descriptions.transformation.mutate.MutateResult
import com.opticdev.sdk.skills_sdk.schema.OMSchema
object Evaluation {

  def forChange(opticChange: OpticChange, sourcegear: SourceGear, projectOption: Option[ProjectBase] = None)(implicit filesStateMonitor: FileStateMonitor, nodeKeyStore: NodeKeyStore, clipboardBuffer: ClipboardBuffer): ChangeResult = opticChange match {
    case im: InsertModel => {
      val stagedNode = StagedNode(im.schemaRef, im.value, Some(RenderOptions(
        generatorId = im.generatorId
      )))

      val renderedTry = Render.fromStagedNode(stagedNode)(sourcegear, sourcegear.flatContext)
      renderedTry.failed.foreach(_.printStackTrace)
      require(renderedTry.isSuccess, "Could not render model "+ renderedTry.failed.get.toString)
      val generatedNode = (renderedTry.get._1, renderedTry.get._2)

      if (im.atLocation.isClipboard) {
        clipboardBuffer.append(generatedNode._2)
        ToClipboard(generatedNode._2)
      } else {
        val resolvedLocation = im.atLocation.resolveToLocation(sourcegear).get
        val changeResult = InsertCode.atLocation(generatedNode, resolvedLocation)
        if (changeResult.isSuccess) {
          changeResult.asFileChanged.stageContentsIn(filesStateMonitor)
        }
        changeResult
      }
    }
    case rt: RunTransformation => {

      val transformationOption = rt.transformationFromSG(sourcegear)
      require(transformationOption.isDefined, "Transformation not found "+  rt.transformationRef.full)

      val transformation = transformationOption.get

      val schema = {
        if (transformation.isGenerateTransform) {
          sourcegear.findSchema(transformation.resolvedOutput(sourcegear).get).get
        } else {
          sourcegear.findSchema(transformation.resolvedInput(sourcegear)).get
        }
      }

      val inputValue = rt.inputValue + ("_name" -> JsString(rt.inputModelName))

      val transformationTry = transformation.transformFunction.transform(inputValue, rt.answers.getOrElse(JsObject.empty), sourcegear.transformationCaller, Some(rt.inputModelId))
      require(transformationTry.isSuccess, "Transformation script encountered error "+ transformationTry.failed)

      val prefixedFlatContent = sourcegear.flatContext.prefix(transformation.packageId.packageId)

      def generateNode(generateResult: GenerateResult, schema: OMSchema, lensIdOption: Option[String], topLevel: Boolean = false) : TransformPatch = {

        val stagedNode = generateResult.toStagedNode(Some(RenderOptions(
            generatorId = lensIdOption
        )))

        require(Try(schema.validate(stagedNode.value)).getOrElse(true), "Result of transformation did not conform to schema "+ schema.schemaRef.full)

        val inputVariableMapping = Try((rt.inputValue \ "_variables").toOption.map(Json.fromJson[VariableMapping]).map(_.get).get)
          .getOrElse(Map.empty)

        val generatedNode = Render.fromStagedNode(stagedNode, inputVariableMapping)(sourcegear, prefixedFlatContent).get



        val updatedString = {
          val objName = rt.inputModelName
          AnnotationRenderer.renderToFirstLine(
            generatedNode._3.renderer.parser.inlineCommentPrefix,
            Vector(SourceAnnotation(objName, transformation.transformationRef, rt.answers)),
            generatedNode._2)
        }

        if (rt.location.isClipboard) {
          ClipboardTransform(generatedNode._2, true)
        } else {
          val resolvedLocation = rt.location.resolveToLocation(sourcegear, Some(stagedNode)).get
          val changeResult = InsertCode.atLocation((generatedNode._1, updatedString), resolvedLocation).asFileChanged
          IntermediateTransformPatch(changeResult.file, changeResult.patchInfo.get.range, changeResult.patchInfo.get.updated, isGeneration = true)
        }
      }

      def mutateNode(mutateResult: MutateResult) : TransformPatch = {
        implicit val context = sourcegear.flatContext.prefix(transformation.packageId.packageId)
        val stagedMutation = mutateResult.toStagedMutation
        val mutated = Mutate.fromStagedMutationWithoutSGContext(stagedMutation)(projectOption.get.asInstanceOf[OpticProject], nodeKeyStore, context)
        require(mutated.isSuccess, s"Failed to mutate node "+mutated.failed.get.getMessage)

        val linkedModelNode = mutated.get._4

        val file = linkedModelNode.fileNode.get.toFile

        IntermediateTransformPatch(file, mutated.get._3, mutated.get._2, isGeneration = false)
      }

      transformationTry.get match {
        case x if x.yieldsGeneration => {
          val intermediateTransformPatch = generateNode(transformationTry.get.asInstanceOf[GenerateResult], schema, rt.generatorId, topLevel = true)

         intermediateTransformPatch match {
           case ClipboardTransform(newContents, isGeneration) => {
             clipboardBuffer.append(newContents)
             ToClipboard(newContents)
           }
           case IntermediateTransformPatch(file, range, newContents, isGeneration) => {
             val fileContents = filesStateMonitor.contentsForFile(file).get
             val changes = FileChanged(file, StringUtils.insertAtIndex(fileContents, range.start, newContents))
             changes.stageContentsIn(filesStateMonitor)
             changes
           }
         }
        }
        case x if x.yieldsMutation => {
          val intermediateTransformPatch = mutateNode(transformationTry.get.asInstanceOf[MutateResult])

          intermediateTransformPatch match {
            case IntermediateTransformPatch(file, range, newContents, isGeneration) => {
              val fileContents = filesStateMonitor.contentsForFile(file).get
              val changes = FileChanged(file, StringUtils.replaceRange(fileContents, range, newContents))
              changes.stageContentsIn(filesStateMonitor)
              changes
            }
            case a => NoChanges //won't allow clipboard for mutations
          }
        }

        case multiTransform:MultiTransform => {
          val changes = MultiTransformEvaluation.apply(multiTransform, rt.location, mutateNode, generateNode, sourcegear)
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

        val output = modelNode match {
          case mn : LinkedModelNode[CommonAstNode] => mn.update(pu.newModel)
          case mmn : MultiModelNode => mmn.update(pu.newModel)
        }

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
      val fileContentsOption = filesStateMonitor.allStaged.get(cSL.file)

      if (fileContentsOption.isDefined) {
        val lines = fileContentsOption.get.text.linesWithSeparators.toVector
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

    implicit val clipboardBuffer = new ClipboardBuffer()

    val results = changeGroup.changes.map(c=> forChange(c, sourcegear, project))

    BatchedChanges(results, filesStateMonitor.allStaged, clipboardBuffer)
  }

}