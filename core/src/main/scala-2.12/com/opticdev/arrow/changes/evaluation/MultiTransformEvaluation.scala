package com.opticdev.arrow.changes.evaluation

import com.opticdev.arrow.changes.location.{EndOfFile, InsertLocation, ResolvedChildInsertLocation}
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.graph.model.{ContainerMapping, NodeMapping}
import com.opticdev.core.sourcegear.mutate.MutationSteps.orderChanges
import com.opticdev.core.sourcegear.project.monitoring.FileStateMonitor
import com.opticdev.sdk.descriptions.Schema
import com.opticdev.sdk.descriptions.transformation.MultiTransform
import com.opticdev.sdk.descriptions.transformation.generate.GenerateResult
import com.opticdev.sdk.descriptions.transformation.mutate.MutateResult

import scala.collection.immutable

object MultiTransformEvaluation {

  type GenerateEval = (GenerateResult, Schema, Option[String]) => IntermediateTransformPatch
  type MutateEval = (MutateResult) => IntermediateTransformPatch

  def apply(multiTransform: MultiTransform, insertLocation: InsertLocation, mutateEval: MutateEval, generateEval: GenerateEval, sourcegear: SourceGear)(implicit fileStateMonitor: FileStateMonitor): FilesChanged = {

    val insertLocationResolved = insertLocation.resolveToLocation(sourcegear).map(_.asInstanceOf[ResolvedChildInsertLocation]).getOrElse(EndOfFile)

    val mutations = multiTransform.transforms.collect {
      case mutate: MutateResult => mutateEval(mutate)
    }

    val generations = multiTransform.transforms.collect {
      case generate: GenerateResult => {
        val stagedNode = generate.toStagedNode()
        generateEval(generate, sourcegear.findSchema(stagedNode.schema).get, stagedNode.options.flatMap(_.lensId))
      }
    }


    val groupedByFile = (mutations ++ generations)
      .groupBy(_.file)
      .mapValues(_.sortBy(_.range.end))

    FilesChanged(groupedByFile.map {
      case (file, patches)=> {
        import com.opticdev.core.utils.StringBuilderImplicits._
        val fileContents = fileStateMonitor.contentsForFile(file).get
        val result = patches.foldLeft ( new StringBuilder(fileContents) ) {
          case (contents, patch) => {
            contents.updateRange(patch.range, patch.newContents)
          }
        }
        FileChanged(file, result.toString())
      }
    }.toSeq:_*)

  }
}
