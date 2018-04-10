package com.opticdev.arrow

import com.opticdev.arrow.context.{ArrowContextBase, NoContext}
import com.opticdev.arrow.graph.{GraphSerialization, KnowledgeGraph}
import com.opticdev.arrow.index.IndexSourceGear
import com.opticdev.arrow.results.Result
import com.opticdev.arrow.search.{GearSearch, TransformationSearch, UnifiedSearch}
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.project.{OpticProject, Project}
import play.api.libs.json.JsObject

class Arrow(val project: OpticProject) {

  implicit val sourcegear: SourceGear = project.projectSourcegear

  implicit val knowledgeGraph: KnowledgeGraph = IndexSourceGear.runFor(sourcegear)

  def search(query: String, context: ArrowContextBase = NoContext): Vector[Result] = {
    UnifiedSearch.search(query, context)(sourcegear, project, knowledgeGraph)
  }

  def transformationsForContext(context: ArrowContextBase) = {
    TransformationSearch.search(context)(sourcegear, project, knowledgeGraph)
  }

  def knowledgeGraphAsJson: JsObject = GraphSerialization.serialize(knowledgeGraph)
}
