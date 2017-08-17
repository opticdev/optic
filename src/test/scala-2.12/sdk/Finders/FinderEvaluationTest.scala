package sdk.Finders

import Fixture.TestBase
import cognitro.parsers.GraphUtils.AstType
import compiler_new.SnippetStageOutput
import compiler_new.errors.{NodeStartingWithStringNotFound, StringNotFound, StringOccurrenceOutOfBounds}
import compiler_new.stages.SnippetBuilder
import sdk.descriptions.Finders.Finder.StringRules
import sdk.descriptions.Finders.{RangeFinder, StringFinder}
import sdk.descriptions.{Lens, Snippet}

class FinderEvaluationTest extends TestBase {

  val block = "var hello = require('world'); var next = hello+1"
  implicit val lens : Lens = Lens("Example", null, Snippet("Testing", "Javascript", "es6", block), null)

  val snippetBuilder = new SnippetBuilder(lens.snippet)
  val snippetStageOutput = snippetBuilder.run

  describe("Finder evaluation") {

    describe("String Finders") {

      describe("Entire") {

        it("finds right node -- occurrence = 0") {
          val stringFinder = StringFinder(StringRules.Entire, "hello", 0)
          val result = stringFinder.evaluateFinder(snippetStageOutput)
          assert(result.nodeType == AstType("Identifier", "Javascript"))
          assert(result.range == (4, 9))
        }

        it("finds right node -- occurrence = 1") {
          val stringFinder = StringFinder(StringRules.Entire, "hello", 1)
          val result = stringFinder.evaluateFinder(snippetStageOutput)
          assert(result.nodeType == AstType("Identifier", "Javascript"))
          assert(result.range == (41, 46))
        }

        it("throws error when string is not found") {
          val stringFinder = StringFinder(StringRules.Entire, "pizza", 1)
          assertThrows[StringNotFound] {
            stringFinder.evaluateFinder(snippetStageOutput)
          }
        }

        it("throws error when string is found but occurrence is out of bounds (19)") {
          val stringFinder = StringFinder(StringRules.Entire, "hello", 19)
          assertThrows[StringOccurrenceOutOfBounds] {
            stringFinder.evaluateFinder(snippetStageOutput)
          }
        }

      }

      describe("Containing") {

        it("finds right node -- occurrence = 0") {
          val stringFinder = StringFinder(StringRules.Containing, "ell", 0)
          val result = stringFinder.evaluateFinder(snippetStageOutput)
          assert(result.nodeType == AstType("Identifier", "Javascript"))
          assert(result.range == (4, 9))
        }

        it("finds right node -- occurrence = 1") {
          val stringFinder = StringFinder(StringRules.Containing, "ell", 1)
          val result = stringFinder.evaluateFinder(snippetStageOutput)
          assert(result.nodeType == AstType("Identifier", "Javascript"))
          assert(result.range == (41, 46))
        }

      }

      describe("Starting") {

        //notice how they get the identifier and not the variable declarator. depth sorting

        it("finds right node -- occurrence = 0") {
          val stringFinder = StringFinder(StringRules.Starting, "hel", 0)
          val result = stringFinder.evaluateFinder(snippetStageOutput)
          assert(result.nodeType == AstType("Identifier", "Javascript"))
          assert(result.range == (4, 9))
        }

        it("finds right node -- occurrence = 1") {
          val stringFinder = StringFinder(StringRules.Starting, "hel", 1)
          val result = stringFinder.evaluateFinder(snippetStageOutput)
          assert(result.nodeType == AstType("Identifier", "Javascript"))
          assert(result.range == (41, 46))
        }

        it("throws error when it can't find a node that starts like this") {
          val stringFinder = StringFinder(StringRules.Starting, "el", 0)
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

  }
}
