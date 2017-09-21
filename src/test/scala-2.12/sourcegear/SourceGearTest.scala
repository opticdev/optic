package sourcegear

import Fixture.TestBase
import Fixture.compilerUtils.{GearUtils, ParserUtils}
import better.files.File
import com.opticdev.parsers.ParserBase
import com.opticdev.core.sdk.descriptions.{CodeComponent, PropertyRule}
import com.opticdev.core.sdk.descriptions.enums.ComponentEnums.{Literal, Token}
import com.opticdev.core.sdk.descriptions.enums.FinderEnums.{Containing, Entire, Starting}
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.gears.{GenerateGear, MutateGear}
import com.opticdev.core.sourcegear.gears.parsing.ParseGear

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
