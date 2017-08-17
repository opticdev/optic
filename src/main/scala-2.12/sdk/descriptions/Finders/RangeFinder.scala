package sdk.descriptions.Finders
import cognitro.parsers.GraphUtils.{AstPrimitiveNode, BaseNode}
import compiler_new.SnippetStageOutput
import compiler_new.errors.NodeWithRangeNotFound
import sdk.descriptions.Lens

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

case class RangeFinder(start: Int, end: Int) extends Finder {
  override def evaluateFinder(snippetStageOutput: SnippetStageOutput)(implicit lens: Lens): AstPrimitiveNode = {

    val exactMatchingNodes = RangeFinder.nodesMatchingRangePredicate(snippetStageOutput.astGraph, (nStart, nEnd)=> {
      (start, end) == (nStart, nEnd)
    })

    val node = exactMatchingNodes.sortBy(i=> i.value.asInstanceOf[AstPrimitiveNode].graphDepth(snippetStageOutput.astGraph)).reverse.headOption

    if (node.isDefined) node.get.value.asInstanceOf[AstPrimitiveNode] else throw new NodeWithRangeNotFound(this)
  }
}

object RangeFinder {

  def nodesMatchingRangePredicate(graph: Graph[BaseNode, LkDiEdge], predicate: (Int, Int)=> Boolean) = {
    graph.nodes.filter((n: graph.NodeT)=> {
      n.isAstNode() && {
        val (start, end) = n.value.asInstanceOf[AstPrimitiveNode].range
        n.value.isAstNode() && predicate(start, end)
      }
    }).toSeq
  }

}