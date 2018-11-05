package com.opticdev.core.compiler.helpers

import com.opticdev.common.PackageRef
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.compiler.stages.SnippetStage
import com.opticdev.parsers.graph.{AstType, CommonAstNode}
import com.opticdev.sdk.descriptions.enums.FinderEnums._
import com.opticdev.core._
import com.opticdev.sdk.skills_sdk.{OMRange, OMSnippet}
import com.opticdev.sdk.skills_sdk.lens.{OMLens, OMLensNodeFinder, OMRangeFinder, OMStringFinder}
import play.api.libs.json.JsObject
class FinderEvaluationSpec extends TestBase {

  val block = "var hello = require('world'); var next = hello+1"
  implicit val lens : OMLens = OMLens(Some("Example"), "example", OMSnippet("es7", block), Map(), Map(), Map(), Left(BlankSchema), JsObject.empty, "es7", PackageRef("test:test"))

  val snippetBuilder = new SnippetStage(lens.snippet)
  val snippetStageOutput = snippetBuilder.run

  describe("String Finders") {

    describe("Entire") {

      it("finds right node -- occurrence = 0") {
        val stringFinder = OMStringFinder(Entire, "hello", 0)
        val result = FinderEvaluator.run(stringFinder, snippetStageOutput)
        assert(result.nodeType == AstType("Identifier", "es7"))
        assert(result.range == Range(4, 9))
      }

      it("finds right node -- occurrence = 1") {
        val stringFinder = OMStringFinder(Entire, "hello", 1)
        val result = FinderEvaluator.run(stringFinder, snippetStageOutput)
        assert(result.nodeType == AstType("Identifier", "es7"))
        assert(result.range == Range(41, 46))
      }

      it("throws error when string is not found") {
        val stringFinder = OMStringFinder(Entire, "pizza", 1)
        assertThrows[Error] {
          FinderEvaluator.run(stringFinder, snippetStageOutput)
        }
      }

      it("throws error when string is found but occurrence is out of bounds (19)") {
        val stringFinder = OMStringFinder(Entire, "hello", 19)
        assertThrows[Error] {
          FinderEvaluator.run(stringFinder, snippetStageOutput)
        }
      }

    }

    describe("Containing") {

      it("finds right node -- occurrence = 0") {
        val stringFinder = OMStringFinder(Containing, "ell", 0)
        val result = FinderEvaluator.run(stringFinder, snippetStageOutput)
        assert(result.nodeType == AstType("Identifier", "es7"))
        assert(result.range == Range(4, 9))
      }

      it("finds right node -- occurrence = 1") {
        val stringFinder = OMStringFinder(Containing, "ell", 1)
        val result = FinderEvaluator.run(stringFinder, snippetStageOutput)
        assert(result.nodeType == AstType("Identifier", "es7"))
        assert(result.range == Range(41, 46))
      }

    }

    describe("Starting") {

      //notice how they get the identifier and not the variable declarator. depth sorting

      it("finds right node -- occurrence = 0") {
        val stringFinder = OMStringFinder(Starting, "hel", 0)
        val result = FinderEvaluator.run(stringFinder, snippetStageOutput)
        assert(result.nodeType == AstType("Identifier", "es7"))
        assert(result.range == Range(4, 9))
      }

      it("finds right node -- occurrence = 1") {
        val stringFinder = OMStringFinder(Starting, "hel", 1)
        val result = FinderEvaluator.run(stringFinder, snippetStageOutput)
        assert(result.nodeType == AstType("Identifier", "es7"))
        assert(result.range == Range(41, 46))
      }

      it("throws error when it can't find a node that starts like this") {
        val stringFinder = OMStringFinder(Starting, "el", 0)
        assertThrows[Error] {
          FinderEvaluator.run(stringFinder, snippetStageOutput)
        }
      }

    }

  }

  describe("Range Finders") {

    it("finds the right node") {
      val rangeFinder = OMRangeFinder(4,9)
      val result = FinderEvaluator.run(rangeFinder, snippetStageOutput)
      assert(result.nodeType == AstType("Identifier", "es7"))
      assert(result.range == Range(4, 9))
    }

  }

  describe("Node Finders") {

    it("finds the right node") {
      val nodeFinder = OMLensNodeFinder("Identifier", OMRange(4,9))
      val result =  FinderEvaluator.run(nodeFinder, snippetStageOutput)
      assert(result.nodeType == AstType("Identifier", "es7"))
      assert(result.range == Range(4, 9))
    }

  }

  describe("with path finder") {

    describe("can find the right path for ") {
      val rangeFinder = OMRangeFinder(4,9)
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
