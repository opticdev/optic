package sourcegear.parser

import Fixture.TestBase
import Fixture.compilerUtils.ParserUtils

class ParserGearTest extends TestBase with ParserUtils {

  describe("ParserGear") {

    describe("save/load") {

      it("can serialize") {
        val parseGear = parseGearFromSnippetWithComponents("var hello = require('world')", Vector())


      }

    }

  }

}
