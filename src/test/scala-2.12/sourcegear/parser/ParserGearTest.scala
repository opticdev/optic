package sourcegear.parser

import Fixture.TestBase
import Fixture.compilerUtils.ParserUtils
import boopickle.CompositePickler
import play.api.libs.json.{Json, Writes}
import sourcegear.gears.{NodeDesc, ParseGear}
import boopickle.Default._
import boopickle.DefaultBasic.PicklerGenerator



class ParserGearTest extends TestBase with ParserUtils {

  describe("ParserGear") {

    describe("save/load") {

      it("can serialize") {
        val parseGear = parseGearFromSnippetWithComponents("var hello = require('world')", Vector())

      }


    }

  }

}
