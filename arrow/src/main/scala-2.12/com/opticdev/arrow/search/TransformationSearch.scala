package com.opticdev.arrow.search

import com.opticdev.arrow.context.{ArrowContextBase, ModelContext}
import com.opticdev.arrow.graph.KnowledgeGraph
import com.opticdev.arrow.results.{GearResult, Result, TransformationResult}
import com.opticdev.core.sourcegear.project.OpticProject
import com.opticdev.core.sourcegear.{Gear, SGContext, SourceGear}
import me.xdrop.fuzzywuzzy.FuzzySearch
import com.opticdev.arrow.graph.KnowledgeGraphImplicits._
import com.opticdev.core.sourcegear.actors.ParseSupervisorSyncAccess
import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, ModelNode}

import scala.util.Try
object TransformationSearch {

  def search(context: ArrowContextBase)(implicit sourcegear: SourceGear, project: OpticProject, knowledgeGraph: KnowledgeGraph) : Vector[TransformationResult] =
    context match {
      case m: ModelContext => m.models.flatMap(c=> {
          val transformations = knowledgeGraph.availableTransformations(c.schemaId)

          val inputValue = Try {
            implicit val sourceGearcontext = sourceGearContext(c)
            c.expandedValue()
          }.getOrElse(c.value)

          //@todo rank based on usage over time...
          transformations.map(t=> TransformationResult(100, t, context, Some(inputValue)))
        })
      case _ => Vector()
    }

  def search(query: String, context: ArrowContextBase)(implicit sourcegear: SourceGear, project: OpticProject, knowledgeGraph: KnowledgeGraph) : Vector[TransformationResult] =
    sourcegear.transformations.map(i=> {
      TransformationResult(
        FuzzySearch.tokenSetPartialRatio(i.yields, query),
        DirectTransformation(i, i.output),
        context,
        None
      )
    }).toVector
      .filterNot(_.score < 50)
      .sortBy(_.score * -1)


  def sourceGearContext(modelNode: BaseModelNode)(implicit project: OpticProject) : SGContext = {
    implicit val sourceGear = project.projectSourcegear
    implicit val actorCluster = project.actorCluster
    val fileNode = modelNode.fileNode
    ParseSupervisorSyncAccess.getContext(fileNode.get.toFile).get
  }

}
