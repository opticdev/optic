package sourcegear.parser

import Fixture.TestBase
import Fixture.compilerUtils.ParserUtils
import play.api.libs.json.{Json, Writes}
import boopickle.Default._
import cognitro.parsers.GraphUtils.Child
import cognitro.parsers.GraphUtils.Path.FlatWalkablePath
import sdk.descriptions.CodeComponent
import sdk.descriptions.Finders.StringFinder
import sdk.descriptions.enums.ComponentEnums.{CodeEnum, Token}
import sdk.descriptions.enums.FinderEnums.Entire
import sourcegear.gears.RuleProvider
import sourcegear.gears.parsing.ParseGear

class ParserGearTest extends TestBase with ParserUtils {

  describe("ParserGear") {

    describe("save/load") {

      it("can serialize") {
        val parseGear = parseGearFromSnippetWithComponents("var hello = require('world')", Vector())
//        Pickle.intoBytes[ParseAsModel](parseGear.asInstanceOf[ParseAsModel])

        val test = CodeComponent(Token, "definedAs", StringFinder(Entire, "hello"))

        import sdk.descriptions.enums.ComponentEnums._

        implicit val rulesProvider = new RuleProvider()

        Pickle.intoBytes(FlatWalkablePath(Vector(Child(3, "hello"))))
//        Pickle.intoBytes(parseGear)

        import sourcegear.serialization.PickleImplicits._

//        Pickle.intoBytes[ParseAsModel](parseGear.asInstanceOf[ParseAsModel])

      }


    }

  }

}
