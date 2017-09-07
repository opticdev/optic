package sdk.Finders

import Fixture.TestBase
import cognitro.parsers.GraphUtils.{AstPrimitiveNode, AstType}
import compiler.SnippetStageOutput
import compiler.errors.{NodeStartingWithStringNotFound, StringNotFound, StringOccurrenceOutOfBounds}
import compiler.stages.SnippetStage
import sdk.descriptions.enums.FinderEnums._
import sdk.descriptions.Finders.{RangeFinder, StringFinder}
import sdk.descriptions.{Lens, Snippet}

class FinderEvaluationTest extends TestBase {

  val block = "var hello = require('world'); var next = hello+1"
  implicit val lens : Lens = Lens("Example", null, Snippet("Testing", "Javascript", "es6", block), Vector(), null)

  val snippetBuilder = new SnippetStage(lens.snippet)
  val snippetStageOutput = snippetBuilder.run

  describe("Finder evaluation") {

    describe("String Finders") {

      describe("Entire") {

        it("finds right node -- occurrence = 0") {
          val stringFinder = StringFinder(Entire, "hello", 0)
          val result = stringFinder.evaluateFinder(snippetStageOutput)
          assert(result.nodeType == AstType("Identifier", "Javascript"))
          assert(result.range == (4, 9))
        }

        it("finds right node -- occurrence = 1") {
          val stringFinder = StringFinder(Entire, "hello", 1)
          val result = stringFinder.evaluateFinder(snippetStageOutput)
          assert(result.nodeType == AstType("Identifier", "Javascript"))
          assert(result.range == (41, 46))
        }

        it("throws error when string is not found") {
          val stringFinder = StringFinder(Entire, "pizza", 1)
          assertThrows[StringNotFound] {
            stringFinder.evaluateFinder(snippetStageOutput)
          }
        }

        it("throws error when string is found but occurrence is out of bounds (19)") {
          val stringFinder = StringFinder(Entire, "hello", 19)
          assertThrows[StringOccurrenceOutOfBounds] {
            stringFinder.evaluateFinder(snippetStageOutput)
          }
        }

      }

      describe("Containing") {

        it("finds right node -- occurrence = 0") {
          val stringFinder = StringFinder(Containing, "ell", 0)
          val result = stringFinder.evaluateFinder(snippetStageOutput)
          assert(result.nodeType == AstType("Identifier", "Javascript"))
          assert(result.range == (4, 9))
        }

        it("finds right node -- occurrence = 1") {
          val stringFinder = StringFinder(Containing, "ell", 1)
          val result = stringFinder.evaluateFinder(snippetStageOutput)
          assert(result.nodeType == AstType("Identifier", "Javascript"))
          assert(result.range == (41, 46))
        }

      }

      describe("Starting") {

        //notice how they get the identifier and not the variable declarator. depth sorting

        it("finds right node -- occurrence = 0") {
          val stringFinder = StringFinder(Starting, "hel", 0)
          val result = stringFinder.evaluateFinder(snippetStageOutput)
          assert(result.nodeType == AstType("Identifier", "Javascript"))
          assert(result.range == (4, 9))
        }

        it("finds right node -- occurrence = 1") {
          val stringFinder = StringFinder(Starting, "hel", 1)
          val result = stringFinder.evaluateFinder(snippetStageOutput)
          assert(result.nodeType == AstType("Identifier", "Javascript"))
          assert(result.range == (41, 46))
        }

        it("throws error when it can't find a node that starts like this") {
          val stringFinder = StringFinder(Starting, "el", 0)
          assertThrows[NodeStartingWithStringNotFound] {
            stringFinder.evaluateFinder(snippetStageOutput)
          }
        }

      }

    }

    describe("Range Finders") {

      it("finds the right node") {
        val rangeFinder = RangeFinder(4,9)
        val result = rangeFinder.evaluateFinder(snippetStageOutput)
        assert(result.nodeType == AstType("Identifier", "Javascript"))
        assert(result.range == (4, 9))
      }

    }

    describe("with path finder") {

      describe("can find the right path for ") {
        val rangeFinder = RangeFinder(4,9)
        val finderPath = rangeFinder.evaluateFinderPath(snippetStageOutput)

        it("root node") {
          val path = finderPath.fromNode(snippetStageOutput.rootNode)
          assert(path.isDefined)
          assert(path.get.childPath.size == 3)
        }

        it("parent node") {
          implicit val graph = finderPath.astGraph
          val parent = finderPath.targetNode.dependencies.head
          val path = finderPath.fromNode(parent.asInstanceOf[AstPrimitiveNode])
          assert(path.isDefined)
          assert(path.get.childPath.size == 1)
        }

      }

    }

  }
}
