package sourcegear

import Fixture.TestBase
import Fixture.compilerUtils.ParserUtils
import better.files.File
import cognitro.parsers.GraphUtils.AstType
import cognitro.parsers.ParserBase
import sdk.descriptions.{CodeComponent, PropertyRule}
import sdk.descriptions.Finders.StringFinder
import sdk.descriptions.enums.ComponentEnums.{Literal, Token}
import sdk.descriptions.enums.FinderEnums.{Containing, Entire, Starting}
import sourcegear.gears.{GenerateGear, MutateGear}
import sourcegear.gears.parsing.ParseGear

/*
INCOMPLETE TESTS. NEED TO DO SOME SERIOUS WORK ON THE SUITE
 */

class SourceGearTest extends TestBase with ParserUtils {

  describe("Source gear test") {
    //@todo factor out duplicate test code.
    // We should have a representation saved which we load in.

    it("test") {
      val sourceGear = new SourceGear {
        override val parser: Set[ParserBase] = Set()
      }

      val parseGear = parseGearFromSnippetWithComponents("var hello = require('world')", Vector(
        CodeComponent(Token, "definedAs", StringFinder(Entire, "hello")),
        CodeComponent(Literal, "pathTo", StringFinder(Containing, "world"))
      ), Vector(
        PropertyRule(StringFinder(Starting, "var"), "kind", "ANY")
      ))

      val importGear = new Gear {
        override val enterOn: Set[AstType] = Set(AstType("VariableDeclaration", "Javascript"))
        override val parser: ParseGear = parseGear
        override val generater: GenerateGear = null
        override val mutator: MutateGear = null
      }

      sourceGear.gearSet.addGear(importGear)

      val testFilePath = getCurrentDirectory + "/src/test/resources/example_source/ImportSource.js"
      println(testFilePath)
      val results = sourceGear.parseFile(File(testFilePath))

      assert(results.size == 3)
      println(results)

    }

  }

}
