package sourcegear

import Fixture.TestBase
import Fixture.compilerUtils.{GearUtils, ParserUtils}
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

class SourceGearTest extends TestBase with GearUtils {

  describe("SourceGear") {

    val sourceGear = new SourceGear {
      override val parser: Set[ParserBase] = Set()
    }

    it("Finds matches in a test file.") {

      val importGear = gearFromDescription("src/test/resources/sdkDescriptions/ImportExample.json")

      sourceGear.gearSet.addGear(importGear)

      val testFilePath = getCurrentDirectory + "/src/test/resources/example_source/ImportSource.js"
      val results = sourceGear.parseFile(File(testFilePath))

      assert(results.size == 2)

    }

  }

}
