package sourcegear.accumulate

import cognitro.parsers.GraphUtils.{AstPrimitiveNode, BaseNode, FileNode}

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

trait LocationRule {
  def subGraph(graph: Graph[BaseNode, LkDiEdge]) : Graph[BaseNode, LkDiEdge]
}

case class InFileRule(file: FileNode) extends LocationRule {
  override def subGraph(graph: Graph[BaseNode, LkDiEdge]): Graph[BaseNode, LkDiEdge] = ???
}

case class ChildOfRule(astPrimitiveNode: AstPrimitiveNode) extends LocationRule {
  override def subGraph(graph: Graph[BaseNode, LkDiEdge]): Graph[BaseNode, LkDiEdge] = ???
}

case class SameParent(astPrimitiveNode: AstPrimitiveNode) extends LocationRule {
  override def subGraph(graph: Graph[BaseNode, LkDiEdge]): Graph[BaseNode, LkDiEdge] = ???
}

case object Anywhere extends LocationRule {
  override def subGraph(graph: Graph[BaseNode, LkDiEdge]): Graph[BaseNode, LkDiEdge] = ???
}
