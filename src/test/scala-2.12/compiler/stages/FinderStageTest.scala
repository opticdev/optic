package compiler.stages

import Fixture.TestBase
import cognitro.parsers.GraphUtils.AstType
import compiler_new.errors.InvalidComponents
import compiler_new.stages.{FinderStage, SnippetStage}
import sdk.descriptions.{Component, Lens, Snippet}
import sdk.descriptions.Component.Types._
import sdk.descriptions.Component.CodeTypes._
import sdk.descriptions.Finders.Finder.StringRules
import sdk.descriptions.Finders.StringFinder

import scala.util.{Failure, Try}

class FinderStageTest extends TestBase {

  describe("Finder Stage") {
    val snippetBlock = "var hello = require('world')"
    val snippet = Snippet("Testing", "Javascript", "es6", snippetBlock)

    implicit val lens : Lens = Lens("Example", null, snippet, Vector(), Vector(
      Component(Code, Token, "definedAs", StringFinder(StringRules.Entire, "hello"))
    ))
    val snippetBuilder = new SnippetStage(snippet)
    val outputTry = Try(snippetBuilder.run)

    val finderStage = new FinderStage(outputTry.get)

    it("Can find paths for components") {
      val finderPath = finderStage.pathForFinder(lens.components.head.finder)
      val targetNode = finderPath.get.targetNode
      assert(targetNode.nodeType == AstType("Identifier", "Javascript"))
    }

    it("Returns valid output") {
      val output = finderStage.run
      assert(output.snippetStageOutput == outputTry.get)
      assert(output.componentFinders.size == 1)
      assert(output.ruleFinders.size == 1)
    }

    it("catches errors valid output") {

      val brokenComponent = Component(Code, Token, "firstProblem", StringFinder(StringRules.Entire, "not-anywhere"))

      finderStage.pathForFinder(brokenComponent.finder)

    }

    describe("error handling") {

      implicit val lens : Lens = Lens("Example", null, snippet, Vector(), Vector(
        Component(Code, Token, "definedAs", StringFinder(StringRules.Entire, "hello")),
        Component(Code, Token, "firstProblem", StringFinder(StringRules.Entire, "not-anywhere")),
        Component(Code, Token, "nextProblem", StringFinder(StringRules.Entire, "nowhere"))
      ))

      val finderStage = new FinderStage(outputTry.get)

      it("collects exceptions from failed component lookup") {
        val results = finderStage.pathForFinder(lens.components(1).finder)
        assert(results.isFailure)
      }

      it("collects 2 errors/3 components") {

        assertThrows[InvalidComponents] {
          finderStage.run
        }

        val results = Try(finderStage.run)

        assert(results.isFailure)
        assert(results.asInstanceOf[Failure[Exception]]
                .exception
                .asInstanceOf[InvalidComponents]
                .invalidComponents.size == 2)

      }


    }

  }

}
