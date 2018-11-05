package com.opticdev.core.compiler.stages

import com.opticdev.core.Fixture.TestBase
import com.opticdev.parsers.graph.AstType
import com.opticdev.core.compiler.errors.InvalidComponents
import com.opticdev.sdk.descriptions.enums.ComponentEnums._
import com.opticdev.sdk.descriptions.enums.FinderEnums.Entire

import scala.util.{Failure, Try}
import com.opticdev.core._
import com.opticdev.parsers.SourceParserManager
import com.opticdev.sdk.skills_sdk.OMSnippet
import com.opticdev.sdk.skills_sdk.lens.{OMLens, OMLensCodeComponent, OMStringFinder, Token}
import play.api.libs.json.JsObject
class FinderStageSpec extends TestBase {

  val snippetBlock = "var hello = require('world')"
  val snippet = OMSnippet("es7", snippetBlock)

  implicit val lens : OMLens = OMLens(Some("Example"), "example", snippet, Map(
    "definedAs" ->  OMLensCodeComponent(Token, OMStringFinder(Entire, "hello"))
  ), Map(), Map(), Left(BlankSchema), JsObject.empty, "es7", null)
  val snippetBuilder = new SnippetStage(snippet)
  val outputTry = Try(snippetBuilder.run)

  val finderStage = new FinderStage(outputTry.get)

  it("can find paths for components") {
    val finderPath = finderStage.pathForFinder(lens.value.head._2.asInstanceOf[OMLensCodeComponent].at)
    val targetNode = finderPath.get.targetNode
    assert(targetNode.nodeType == AstType("Identifier", "es7"))
  }

  it("returns valid output") {
    val output = finderStage.run
    assert(output.componentFinders.size == 1)
    assert(output.ruleFinders.size == 1)
  }

  it("catches errors valid output") {
    val brokenComponent = OMStringFinder(Entire, "not-anywhere")
    finderStage.pathForFinder(brokenComponent)
  }

  describe("error handling") {

    implicit val lens : OMLens = OMLens(Some("Example"), "example", snippet, Map(
      "definedAs" ->  OMLensCodeComponent(Token, OMStringFinder(Entire, "hello")),
      "firstProblem" -> OMLensCodeComponent(Token, OMStringFinder(Entire, "not-anywhere")),
      "nextProblem" -> OMLensCodeComponent(Token, OMStringFinder(Entire, "nowhere"))
    ), Map(), Map(), Left(BlankSchema), JsObject.empty, "es7", null)

    val finderStage = new FinderStage(outputTry.get)

    it("collects exceptions from failed component lookup") {
      val results = finderStage.pathForFinder(lens.value("firstProblem").asInstanceOf[OMLensCodeComponent].at)
      assert(results.isFailure)
    }

  }


}
