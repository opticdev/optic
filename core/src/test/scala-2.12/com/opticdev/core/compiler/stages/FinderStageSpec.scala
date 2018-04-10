package com.opticdev.core.compiler.stages

import com.opticdev.core.Fixture.TestBase
import com.opticdev.parsers.graph.AstType
import com.opticdev.core.compiler.errors.InvalidComponents
import com.opticdev.sdk.descriptions.{CodeComponent, Component, Lens, Snippet}
import com.opticdev.sdk.descriptions.enums.ComponentEnums._
import com.opticdev.sdk.descriptions.enums.FinderEnums.Entire
import com.opticdev.sdk.descriptions.finders.StringFinder

import scala.util.{Failure, Try}
import com.opticdev.core._
import com.opticdev.parsers.SourceParserManager
class FinderStageSpec extends TestBase {

  val snippetBlock = "var hello = require('world')"
  val snippet = Snippet("es7", snippetBlock)

  implicit val lens : Lens = Lens(Some("Example"), "example", BlankSchema, snippet, Vector(
    CodeComponent(Seq("definedAs"), StringFinder(Entire, "hello"))
  ), Vector(), Vector())
  val snippetBuilder = new SnippetStage(snippet)
  val outputTry = Try(snippetBuilder.run)

  val finderStage = new FinderStage(outputTry.get)

  it("can find paths for components") {
    val finderPath = finderStage.pathForFinder(lens.components.head.asInstanceOf[CodeComponent].finder)
    val targetNode = finderPath.get.targetNode
    assert(targetNode.nodeType == AstType("Identifier", "es7"))
  }

  it("returns valid output") {
    val output = finderStage.run
    assert(output.componentFinders.size == 1)
    assert(output.ruleFinders.size == 1)
  }

  it("catches errors valid output") {

    val brokenComponent = CodeComponent(Seq("firstProblem"), StringFinder(Entire, "not-anywhere"))

    finderStage.pathForFinder(brokenComponent.finder)

  }

  describe("error handling") {

    implicit val lens : Lens = Lens(Some("Example"), "example", BlankSchema, snippet, Vector(
      CodeComponent(Seq("definedAs"), StringFinder(Entire, "hello")),
      CodeComponent(Seq("firstProblem"), StringFinder(Entire, "not-anywhere")),
      CodeComponent(Seq("nextProblem"), StringFinder(Entire, "nowhere"))
    ), Vector(), Vector())

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
