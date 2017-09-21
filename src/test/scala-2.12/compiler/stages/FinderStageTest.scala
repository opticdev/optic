package compiler.stages

import Fixture.TestBase
import com.opticdev.parsers.graph.AstType
import com.opticdev.core.compiler.errors.InvalidComponents
import com.opticdev.core.compiler.stages.{FinderStage, SnippetStage}
import com.opticdev.core.sdk.descriptions.{CodeComponent, Component, Lens, Snippet}
import com.opticdev.core.sdk.descriptions.enums.FinderEnums._
import com.opticdev.core.sdk.descriptions.enums.ComponentEnums._
import com.opticdev.core.sdk.descriptions.enums.Finders.StringFinder

import scala.util.{Failure, Try}

class FinderStageTest extends TestBase {

  describe("Finder Stage") {
    val snippetBlock = "var hello = require('world')"
    val snippet = Snippet("Testing", "Javascript", "es6", snippetBlock)

    implicit val lens : Lens = Lens("Example", null, snippet, Vector(), Vector(
      CodeComponent(Token, "definedAs", StringFinder(Entire, "hello"))
    ))
    val snippetBuilder = new SnippetStage(snippet)
    val outputTry = Try(snippetBuilder.run)

    val finderStage = new FinderStage(outputTry.get)

    it("Can find paths for components") {
      val finderPath = finderStage.pathForFinder(lens.components.head.asInstanceOf[CodeComponent].finder)
      val targetNode = finderPath.get.targetNode
      assert(targetNode.nodeType == AstType("Identifier", "Javascript"))
    }

    it("Returns valid output") {
      val output = finderStage.run
      assert(output.componentFinders.size == 1)
      assert(output.ruleFinders.size == 1)
    }

    it("catches errors valid output") {

      val brokenComponent = CodeComponent(Token, "firstProblem", StringFinder(Entire, "not-anywhere"))

      finderStage.pathForFinder(brokenComponent.finder)

    }

    describe("error handling") {

      implicit val lens : Lens = Lens("Example", null, snippet, Vector(), Vector(
        CodeComponent(Token, "definedAs", StringFinder(Entire, "hello")),
        CodeComponent(Token, "firstProblem", StringFinder(Entire, "not-anywhere")),
        CodeComponent(Token, "nextProblem", StringFinder(Entire, "nowhere"))
      ))

      val finderStage = new FinderStage(outputTry.get)

      it("collects exceptions from failed component lookup") {
        val results = finderStage.pathForFinder(lens.components(1).asInstanceOf[CodeComponent].finder)
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
