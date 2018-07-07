package com.opticdev.arrow.changes.evaluation

import com.opticdev.arrow.changes.location.{EndOfFile, InsertLocation, ResolvedChildInsertLocation}
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.graph.model.{ContainerMapping, NodeMapping}
import com.opticdev.core.sourcegear.mutate.MutationSteps.orderChanges
import com.opticdev.core.sourcegear.project.monitoring.FileStateMonitor
import com.opticdev.sdk.descriptions.transformation.MultiTransform
import com.opticdev.sdk.descriptions.transformation.generate.GenerateResult
import com.opticdev.sdk.descriptions.transformation.mutate.MutateResult
import com.opticdev.sdk.opticmarkdown2.schema.OMSchema
import play.api.libs.json.JsString

import scala.collection.immutable

object MultiTransformEvaluation {

  type GenerateEval = (GenerateResult, OMSchema, Option[String], Boolean) => IntermediateTransformPatch
  type MutateEval = (MutateResult) => IntermediateTransformPatch

  def apply(multiTransform: MultiTransform, insertLocation: InsertLocation, mutateEval: MutateEval, generateEval: GenerateEval, sourcegear: SourceGear)(implicit fileStateMonitor: FileStateMonitor): FilesChanged = {

    val insertLocationResolved = insertLocation.resolveToLocation(sourcegear).map(_.asInstanceOf[ResolvedChildInsertLocation]).getOrElse(EndOfFile)

    val mutations = multiTransform.transforms.collect {
      case mutate: MutateResult => mutateEval(mutate)
    }

    val generations = multiTransform.transforms.collect {
      case generate: GenerateResult => {
        val stagedNode = generate.toStagedNode()
        generateEval(generate, sourcegear.findSchema(stagedNode.schema).orNull, stagedNode.options.flatMap(_.lensId), false)
      }
    }


    val groupedByFile = (mutations ++ generations)
      .groupBy(_.file)
      .mapValues(_.sortBy(_.range.end))

    FilesChanged(groupedByFile.map {
      case (file, patches)=> {
        import com.opticdev.core.utils.StringBuilderImplicits._

        //offset multi generations in the same spot
        val offsetGenerations=
          patches
            .filter(_.isGeneration)
            .groupBy(_.range.start)
            .filter(_._2.size > 1).flatMap {
              case (startIndex, inserts) => {
                inserts.zipWithIndex.map {case (item, index) => {
                  val previous = inserts.lift(index - 1)
                  previous.map(i=> (item, item.copy(range = Range(item.range.start + i.range.size, item.range.end + i.range.size))))
                }}
              }
            }.collect{case x if x.isDefined => x.get}
             .toMap

        //replace patches with updated ones
        val updatedPatches = patches.map(patch=> offsetGenerations.getOrElse(patch, patch))

        val fileContents = fileStateMonitor.contentsForFile(file).getOrElse("")
        val result = updatedPatches.foldLeft ( new StringBuilder(fileContents) ) {
          case (contents, patch) => {
            contents.updateRange(patch.range, patch.newContents)
          }
        }
        FileChanged(file, result.toString())
      }
    }.toSeq:_*)

  }
}
