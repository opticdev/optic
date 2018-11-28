package com.opticdev.common.graph
import scalax.collection.edge.Implicits._
import scalax.collection.mutable.Graph

object GraphImplicits {

  implicit class GraphInstance(graph: AstGraph) {
    def root : Option[CommonAstNode] = graph
      .nodes
      .filter(i=> i.value.isAstNode && i.value.asInstanceOf[CommonAstNode].parent(graph).isEmpty)
      .map(_.value.asInstanceOf[CommonAstNode])
      .headOption

    def repositionGraphHead(node: CommonAstNode, contents: String) : (CommonAstNode, String, AstGraph) = {
      val parentNode = graph.get(node)

      val root = graph.root.get

      //filter out everything but node and its children
      val subgraph = graph.filter(graph.having(
        (n) => n.isSuccessorOf(parentNode) || n == parentNode
      ))

      val offset = node.range.start

      def offsetRanges(n: CommonAstNode) = {
        n.copy(range = Range(n.range.start - offset, n.range.end - offset))
      }

      val updatedEdges = subgraph.edges.map(i=> {
        (offsetRanges(i.from.value.asInstanceOf[CommonAstNode]) ~+#> offsetRanges(i.to.value.asInstanceOf[CommonAstNode]))(i.label)
      })

      val newGraph = Graph.from(edges = updatedEdges).asInstanceOf[AstGraph]

      val newNode = offsetRanges(node)

      newGraph.add((root.copy(range = newNode.range) ~+#> newNode)(Child(0, "children", fromArray = true)))

      (newNode, contents.substring(node.range.start, node.range.end), newGraph)
    }

  }



}
