package sourcegear.parser

import Fixture.TestBase
import Fixture.compilerUtils.ParserUtils
import better.files.File
import play.api.libs.json.{Json, Writes}
import boopickle.Default._
import cognitro.parsers.GraphUtils.Child
import cognitro.parsers.GraphUtils.Path.FlatWalkablePath
import sdk.StringProperty
import sdk.descriptions.{CodeComponent, PropertyRule}
import sdk.descriptions.Finders.StringFinder
import sdk.descriptions.enums.ComponentEnums.{CodeEnum, Token}
import sdk.descriptions.enums.FinderEnums.{Entire, Starting}
import sourcegear.gears.RuleProvider
import sourcegear.gears.parsing.{ParseAsModel, ParseGear}
import sourcegear.serialization.GearLoader
import sourcegear.serialization.SerializeGears._

class ParserGearTest extends TestBase with ParserUtils {

  describe("ParserGear") {

    describe("save/load") {

      it("can serialize & load") {
        val parseGear: ParseGear = parseGearFromSnippetWithComponents("var hello = require('world')", Vector())

        val toFile = parseGear.toFile(File("src/test/resources/tmp/exampleGear.optic"))
        assert(toFile.isSuccess)

        val loaded = GearLoader.parseGearFromFile(toFile.get)
        assert(loaded.isSuccess)

        //compare to each other
        assert(parseGear == loaded.get)

      }

    }

  }

}
