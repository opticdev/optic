package com.opticdev.common

import com.opticdev.common.graph.{AstType, CommonAstNode, GraphBuilder}
import org.scalatest.FunSpec

class GraphBuilderSpec extends FunSpec {

  describe("Graph Builder") {

    it("Can build graph") {

      val programNode = CommonAstNode(AstType("Program", "JavaScript"), Range(0, 5), null)

        val child0 = CommonAstNode(AstType("Expression", "JavaScript"), Range(0, 1), null)
        val child1 = CommonAstNode(AstType("Expression", "JavaScript"), Range(0, 2), null)
          val grandChild0 = CommonAstNode(AstType("Expression", "JavaScript"), Range(2, 4), null)

      val graphBuilder = new GraphBuilder[CommonAstNode]()

      val builderPhase = graphBuilder.setRootNode(programNode)

        builderPhase.addChild(0, "Child", child0)
        val builderPhase2 = builderPhase.addChild(1, "Child", child1)
          builderPhase2.addChild(0, "Grandchild", grandChild0)

      implicit val graph = graphBuilder.graph

      assert(graphBuilder.graph.nodes.size == 4)

      assert(programNode.parent.isEmpty)
      assert(child0.parent.get == programNode)
      assert(child1.parent.get == programNode)
      assert(grandChild0.parent.get == child1)

    }

  }

}
