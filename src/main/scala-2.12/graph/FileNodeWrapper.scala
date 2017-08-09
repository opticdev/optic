package graph

import cognitro.parsers.GraphUtils._
import jdk.nashorn.api.scripting.{AbstractJSObject, ScriptObjectMirror}
import play.api.libs.json.{JsObject, JsValue}

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph


case class FileNodeWrapper(override val node: BaseFileNode) (implicit val graph: Graph[BaseNode, LkDiEdge]) extends NodeWrapper {

  def astNodes: Vector[AstNodeWrapper] = node.allAstNodes(graph)
    .toVector
    .map(AstNodeWrapper(_))

}