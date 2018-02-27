package com.opticdev.arrow

import com.opticdev.arrow.context.{ArrowContextBase, NoContext}
import com.opticdev.arrow.graph.KnowledgeGraph
import com.opticdev.arrow.index.IndexSourceGear
import com.opticdev.arrow.results.Result
import com.opticdev.arrow.search.{GearSearch, TransformationSearch}
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.project.{OpticProject, Project}

class Arrow(val project: OpticProject) {

  implicit val sourcegear: SourceGear = project.projectSourcegear

  implicit val knowledgeGraph: KnowledgeGraph = IndexSourceGear.runFor(sourcegear)

  def search(query: String, context: ArrowContextBase = NoContext): Vector[Result] = {
    GearSearch.search(query, context)(sourcegear, project)
  }

  def transformationsForContext(context: ArrowContextBase) = {
    TransformationSearch.search(context)(sourcegear, project, knowledgeGraph)
  }

}
