package com.opticdev.arrow

import com.opticdev.arrow.context.{ArrowContextBase, NoContext}
import com.opticdev.arrow.graph.{GraphSerialization, KnowledgeGraph}
import com.opticdev.arrow.index.{IndexSourceGear, TransformationSearch}
import com.opticdev.arrow.results.Result
import com.opticdev.arrow.state.NodeKeyStore
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.project.{OpticProject, Project}
import play.api.libs.json.JsObject

class Arrow(val project: OpticProject) {

  implicit val nodeKeyStore = project.nodeKeyStore

  implicit val sourcegear: SourceGear = project.projectSourcegear

  implicit val knowledgeGraph: KnowledgeGraph = IndexSourceGear.runFor(sourcegear)

  def transformationsForContext(context: ArrowContextBase, editorSlug: String) = {
    TransformationSearch.search(context)(sourcegear, project, knowledgeGraph, editorSlug, nodeKeyStore)
  }

  def knowledgeGraphAsJson: JsObject = GraphSerialization.serialize(knowledgeGraph)
}
