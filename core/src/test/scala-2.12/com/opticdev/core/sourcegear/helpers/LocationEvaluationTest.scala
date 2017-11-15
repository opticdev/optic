package com.opticdev.core.sourcegear.helpers
import com.opticdev.core.actorSystem
import better.files.File
import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.compiler.stages.SnippetStage
import com.opticdev.core.sdk.descriptions.enums.FinderEnums
import com.opticdev.core.sdk.descriptions.enums.LocationEnums.{Anywhere, _}
import com.opticdev.core.sdk.descriptions.finders.StringFinder
import com.opticdev.core.sdk.descriptions.helpers.AstLocation
import com.opticdev.core.sdk.descriptions.{Lens, Location, Snippet}
import com.opticdev.core.sourcegear.gears.helpers.LocationEvaluation

class LocationEvaluationTest extends TestBase {

  describe("Location evaluation test") {

    val snippetBlock = File("test-examples/resources/example_source/LocationPlayground.js").contentAsString
    val snippet = Snippet("Testing", "Javascript", "es6", snippetBlock)

    implicit val lens : Lens = Lens("Example", null, snippet, Vector(), Vector())

    val snippetOutput = new SnippetStage(snippet).run

    val root = snippetOutput.rootNode
    implicit val astGraph = snippetOutput.astGraph

    val hatfield1 = StringFinder(FinderEnums.Entire, "Hatfield1").evaluateFinder(snippetOutput)
    val hatfield2 = StringFinder(FinderEnums.Entire, "Hatfield2").evaluateFinder(snippetOutput)
    val williamHatfield = StringFinder(FinderEnums.Entire, "WilliamHatfield").evaluateFinder(snippetOutput)

    val farm = StringFinder(FinderEnums.Starting, "function farm").evaluateFinder(snippetOutput)

      val mcCoy1 = StringFinder(FinderEnums.Entire, "McCoy1").evaluateFinder(snippetOutput)
      val mcCoy2 = StringFinder(FinderEnums.Entire, "McCoy2").evaluateFinder(snippetOutput)

      val shed = StringFinder(FinderEnums.Starting, "function shed").evaluateFinder(snippetOutput)

        val moonshine = StringFinder(FinderEnums.Entire, "Moonshine").evaluateFinder(snippetOutput)

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



}
