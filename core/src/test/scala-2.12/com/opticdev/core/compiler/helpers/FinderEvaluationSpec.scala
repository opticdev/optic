package com.opticdev.core.compiler.helpers

import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.compiler.errors.{NodeStartingWithStringNotFound, StringNotFound, StringOccurrenceOutOfBounds}
import com.opticdev.core.compiler.stages.SnippetStage
import com.opticdev.parsers.graph.{CommonAstNode, AstType}
import com.opticdev.sdk.descriptions.enums.FinderEnums._
import com.opticdev.sdk.descriptions.finders.{NodeFinder, RangeFinder, StringFinder}
import com.opticdev.sdk.descriptions.{Lens, Snippet}
import com.opticdev.core._
class FinderEvaluationSpec extends TestBase {

  val block = "var hello = require('world'); var next = hello+1"
  implicit val lens : Lens = Lens(Some("Example"), "example", BlankSchema, Snippet("es7", block), Vector(), Vector(), Vector())

  val snippetBuilder = new SnippetStage(lens.snippet)
  val snippetStageOutput = snippetBuilder.run

  describe("String Finders") {

    describe("Entire") {

      it("finds right node -- occurrence = 0") {
        val stringFinder = StringFinder(Entire, "hello", 0)
        val result = FinderEvaluator.run(stringFinder, snippetStageOutput)
        assert(result.nodeType == AstType("Identifier", "es7"))
        assert(result.range == Range(4, 9))
      }

      it("finds right node -- occurrence = 1") {
        val stringFinder = StringFinder(Entire, "hello", 1)
        val result = FinderEvaluator.run(stringFinder, snippetStageOutput)
        assert(result.nodeType == AstType("Identifier", "es7"))
        assert(result.range == Range(41, 46))
      }

      it("throws error when string is not found") {
        val stringFinder = StringFinder(Entire, "pizza", 1)
        assertThrows[StringNotFound] {
          FinderEvaluator.run(stringFinder, snippetStageOutput)
        }
      }

      it("throws error when string is found but occurrence is out of bounds (19)") {
        val stringFinder = StringFinder(Entire, "hello", 19)
        assertThrows[StringOccurrenceOutOfBounds] {
          FinderEvaluator.run(stringFinder, snippetStageOutput)
        }
      }

    }

    describe("Containing") {

      it("finds right node -- occurrence = 0") {
        val stringFinder = StringFinder(Containing, "ell", 0)
        val result = FinderEvaluator.run(stringFinder, snippetStageOutput)
        assert(result.nodeType == AstType("Identifier", "es7"))
        assert(result.range == Range(4, 9))
      }

      it("finds right node -- occurrence = 1") {
        val stringFinder = StringFinder(Containing, "ell", 1)
        val result = FinderEvaluator.run(stringFinder, snippetStageOutput)
        assert(result.nodeType == AstType("Identifier", "es7"))
        assert(result.range == Range(41, 46))
      }

    }

    describe("Starting") {

      //notice how they get the identifier and not the variable declarator. depth sorting

      it("finds right node -- occurrence = 0") {
        val stringFinder = StringFinder(Starting, "hel", 0)
        val result = FinderEvaluator.run(stringFinder, snippetStageOutput)
        assert(result.nodeType == AstType("Identifier", "es7"))
        assert(result.range == Range(4, 9))
      }

      it("finds right node -- occurrence = 1") {
        val stringFinder = StringFinder(Starting, "hel", 1)
        val result = FinderEvaluator.run(stringFinder, snippetStageOutput)
        assert(result.nodeType == AstType("Identifier", "es7"))
        assert(result.range == Range(41, 46))
      }

      it("throws error when it can't find a node that starts like this") {
        val stringFinder = StringFinder(Starting, "el", 0)
        assertThrows[NodeStartingWithStringNotFound] {
          FinderEvaluator.run(stringFinder, snippetStageOutput)
        }
      }

    }

  }

  describe("Range Finders") {

    it("finds the right node") {
      val rangeFinder = RangeFinder(4,9)
      val result = FinderEvaluator.run(rangeFinder, snippetStageOutput)
      assert(result.nodeType == AstType("Identifier", "es7"))
      assert(result.range == Range(4, 9))
    }

  }

  describe("Node Finders") {

    it("finds the right node") {
      val nodeFinder = NodeFinder( AstType("Identifier", "es7"), Range(4,9))
      val result =  FinderEvaluator.run(nodeFinder, snippetStageOutput)
      assert(result.nodeType == AstType("Identifier", "es7"))
      assert(result.range == Range(4, 9))
    }

  }

  describe("with path finder") {

    describe("can find the right path for ") {
      val rangeFinder = RangeFinder(4,9)
      val finderPath = FinderEvaluator.finderPath(rangeFinder, snippetStageOutput)

      it("root node") {
        val path = finderPath.fromNode(snippetStageOutput.rootNode)
        assert(path.isDefined)
        assert(path.get.childPath.size == 3)
      }

      it("parent node") {
        implicit val graph = finderPath.astGraph
        val parent = finderPath.targetNode.dependencies.head
        val path = finderPath.fromNode(parent.asInstanceOf[CommonAstNode])
        assert(path.isDefined)
        assert(path.get.childPath.size == 1)
      }

    }

  }
}
