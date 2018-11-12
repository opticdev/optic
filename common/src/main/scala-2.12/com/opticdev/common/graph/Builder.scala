package com.opticdev.common.graph

import scalax.collection.mutable.Graph
import scalax.collection.edge.Implicits._


class GraphBuilder[C <: BaseNode](val graph: AstGraph = Graph()) {

  def setRootNode(node: C) : BuilderPhase[C] = {
    new BuilderPhase[C](Option(node))(graph).addChild(0, null, node)
  }

  def rootPhase: BuilderPhase[C] = {
    new BuilderPhase[C](None)(graph)
  }

}

class BuilderPhase[C <: BaseNode](parent: Option[C])(implicit val graph: AstGraph) {
  def addChild(index: Int, childType: String, node: C, fromArray: Boolean = false) : BuilderPhase[C] = {
    if (parent.isDefined) {
      graph add (parent.get ~+#> node) (Child(index, childType, fromArray))
    } else {
      graph add node
    }
    new BuilderPhase(Option(node))
  }
}
