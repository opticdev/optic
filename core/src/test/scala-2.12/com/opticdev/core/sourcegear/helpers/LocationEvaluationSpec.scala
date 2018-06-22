package com.opticdev.core.sourcegear.helpers
import com.opticdev.core.actorSystem
import better.files.File
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.compiler.helpers.FinderEvaluator
import com.opticdev.core.compiler.stages.SnippetStage
import com.opticdev.sdk.descriptions.enums.FinderEnums
import com.opticdev.sdk.descriptions.enums.LocationEnums.{Anywhere, _}
import com.opticdev.sdk.descriptions.helpers.AstLocation
import com.opticdev.core._
import com.opticdev.core.sourcegear.gears.helpers.LocationEvaluation
import com.opticdev.sdk.descriptions.Location
import com.opticdev.sdk.opticmarkdown2.OMSnippet
import com.opticdev.sdk.opticmarkdown2.lens.{OMLens, OMStringFinder}
import play.api.libs.json.JsObject

class LocationEvaluationSpec extends TestBase {

  val snippetBlock = File("test-examples/resources/example_source/LocationPlayground.js").contentAsString
  val snippet = OMSnippet("es7", snippetBlock)

  implicit val lens : OMLens = OMLens(Some("Example"), "example", snippet, Map(), Map(), Map(), Left(BlankSchema), JsObject.empty, null)

  val snippetOutput = new SnippetStage(snippet).run

  val root = snippetOutput.rootNode
  implicit val astGraph = snippetOutput.astGraph

  val hatfield1 = FinderEvaluator.run(OMStringFinder(FinderEnums.Entire, "Hatfield1"), snippetOutput)
  val hatfield2 = FinderEvaluator.run(OMStringFinder(FinderEnums.Entire, "Hatfield2"), snippetOutput)
  val williamHatfield = FinderEvaluator.run(OMStringFinder(FinderEnums.Entire, "WilliamHatfield"), snippetOutput)

  val farm = FinderEvaluator.run(OMStringFinder(FinderEnums.Starting, "function farm"), snippetOutput)

    val mcCoy1 = FinderEvaluator.run(OMStringFinder(FinderEnums.Entire, "McCoy1"), snippetOutput)
    val mcCoy2 = FinderEvaluator.run(OMStringFinder(FinderEnums.Entire, "McCoy2"), snippetOutput)

    val shed = FinderEvaluator.run(OMStringFinder(FinderEnums.Starting, "function shed"), snippetOutput)

      val moonshine = FinderEvaluator.run(OMStringFinder(FinderEnums.Entire, "Moonshine"), snippetOutput)

  it("Works for Anywhere") {
    assert(LocationEvaluation.matches(Location(Anywhere), shed, root))
    assert(LocationEvaluation.matches(Location(Anywhere), moonshine, mcCoy1))
  }

  it("Works for InSameFile") {
    assert(LocationEvaluation.matches(Location(InSameFile), shed, root))
    assert(LocationEvaluation.matches(Location(InSameFile), moonshine, mcCoy1))
  }

  it("Works for Sibling") {
    assert(LocationEvaluation.matches(Location(Sibling), hatfield1, hatfield2))
    assert(LocationEvaluation.matches(Location(Sibling), mcCoy1, mcCoy2))
    //also matches self (definition of sibling is had same parent)
    assert(LocationEvaluation.matches(Location(Sibling), hatfield1, hatfield1))

    assert(!LocationEvaluation.matches(Location(Sibling), hatfield1, williamHatfield))

  }

  it("Works for ChildOf") {
    assert(LocationEvaluation.matches(Location(ChildOf(AstLocation(farm))), moonshine))
    assert(LocationEvaluation.matches(Location(ChildOf(AstLocation(shed))), moonshine))

    assert(!LocationEvaluation.matches(Location(ChildOf(AstLocation(farm))), hatfield1))

  }

  it("Works for ParentOf") {
    assert(LocationEvaluation.matches(Location(ParentOf(AstLocation(moonshine))), farm))
    assert(LocationEvaluation.matches(Location(ParentOf(AstLocation(shed))), farm))
    assert(LocationEvaluation.matches(Location(ParentOf(AstLocation(mcCoy1))), farm))

    assert(!LocationEvaluation.matches(Location(ParentOf(AstLocation(hatfield1))), farm))

  }

}
