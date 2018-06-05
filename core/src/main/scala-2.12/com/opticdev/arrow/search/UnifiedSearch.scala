package com.opticdev.arrow.search

import com.opticdev.arrow.context.ArrowContextBase
import com.opticdev.arrow.graph.KnowledgeGraph
import com.opticdev.arrow.results.{Result, TransformationResult}
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.project.OpticProject
import me.xdrop.fuzzywuzzy.FuzzySearch

object UnifiedSearch {

  def search(query: String, context: ArrowContextBase)(implicit sourcegear: SourceGear, project: OpticProject, knowledgeGraph: KnowledgeGraph, editorSlug: String) : Vector[Result] = {
    val gearResults = GearSearch.search(query, context)
    val transformationResults = TransformationSearch.search(query, context)

    (gearResults ++ transformationResults).sortBy(_.score * -1)
  }

}
