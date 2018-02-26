package com.opticdev.arrow.search

import com.opticdev.arrow.context.{ArrowContextBase, ModelContext}
import com.opticdev.arrow.graph.KnowledgeGraph
import com.opticdev.arrow.results.{GearResult, Result, TransformationResult}
import com.opticdev.core.sourcegear.project.OpticProject
import com.opticdev.core.sourcegear.{Gear, SourceGear}
import me.xdrop.fuzzywuzzy.FuzzySearch
import com.opticdev.arrow.graph.KnowledgeGraphImplicits._
object TransformationSearch {

  def search(context: ArrowContextBase)(implicit sourcegear: SourceGear, project: OpticProject, knowledgeGraph: KnowledgeGraph) : Vector[TransformationResult] =
    context match {
      case m: ModelContext => m.models.flatMap(c=> {
          val transformations = knowledgeGraph.availableTransformations(c.schemaId)

          //@todo rank based on usage over time...
          transformations.map(t=> TransformationResult(100, t, context))
        })
      case _ => Vector()
    }
}
