package graph
import cognitro.parsers.GraphUtils.{BaseNode, FileNode, ModelNode}
import play.api.libs.json.JsValue

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

case class ModelNodeWrapper(override val node: ModelNode) (implicit val graph: Graph[BaseNode, LkDiEdge]) extends NodeWrapper {

  override def toString: String = node.toString

  def updateValue(newValue: JsValue) = {
    if (node.isInstanceOf[InsightModelNode]) {
      node.asInstanceOf[InsightModelNode].updateValue(newValue)
    }
  }

}
