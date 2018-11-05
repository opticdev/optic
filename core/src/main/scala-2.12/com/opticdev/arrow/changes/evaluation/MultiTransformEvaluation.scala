package com.opticdev.arrow.changes.evaluation

import better.files.File
import com.opticdev.arrow.changes.location.{EndOfFile, InsertLocation, ResolvedChildInsertLocation}
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.graph.model.{ContainerMapping, NodeMapping}
import com.opticdev.core.sourcegear.mutate.MutationSteps.orderChanges
import com.opticdev.core.sourcegear.project.monitoring.FileStateMonitor
import com.opticdev.core.utils.StringUtils
import com.opticdev.sdk.descriptions.transformation.MultiTransform
import com.opticdev.sdk.descriptions.transformation.generate.GenerateResult
import com.opticdev.sdk.descriptions.transformation.mutate.MutateResult
import com.opticdev.sdk.skills_sdk.schema.OMSchema
import play.api.libs.json.JsString

import scala.collection.immutable

object MultiTransformEvaluation {

  type GenerateEval = (GenerateResult, OMSchema, Option[String], Boolean) => TransformPatch
  type MutateEval = (MutateResult) => TransformPatch

  def apply(multiTransform: MultiTransform, insertLocation: InsertLocation, mutateEval: MutateEval, generateEval: GenerateEval, sourcegear: SourceGear)(implicit fileStateMonitor: FileStateMonitor): FilesChanged = {

    val insertLocationResolved = insertLocation.resolveToLocation(sourcegear).map(_.asInstanceOf[ResolvedChildInsertLocation]).getOrElse(EndOfFile)

    val mutations = multiTransform.transforms.collect {
      case mutate: MutateResult => mutateEval(mutate)
    }

    val generations = multiTransform.transforms.collect {
      case generate: GenerateResult => {
        val stagedNode = generate.toStagedNode()
        generateEval(generate, sourcegear.findSchema(stagedNode.schema).orNull, stagedNode.options.flatMap(_.generatorId), false)
      }
    }


    val groupedByFile: Map[Option[File], Seq[IntermediateTransformPatch]] = (mutations ++ generations)
      .filterNot(_.isClipboard)
      .map(_.asInstanceOf[IntermediateTransformPatch])
      .groupBy(_.fileOption)
      .mapValues(_.sortBy(_.range.end))

    FilesChanged(groupedByFile.map {
      case (file, patches)=> {
        import com.opticdev.core.utils.StringBuilderImplicits._

        val fileContents = fileStateMonitor.contentsForFile(file.get).getOrElse("")
        val result = patches.reverse.foldLeft ( new StringBuilder(fileContents) ) {
          case (contents, patch) => {
            if (patch.isGeneration) {
              contents.insertAtIndex(patch.range.start, patch.newContents)
            } else {
              contents.updateRange(patch.range, patch.newContents)
            }
          }
        }
        FileChanged(file.get, result.toString())
      }
    }.toSeq:_*)

  }
}
