package compiler.stages

import Fixture.TestBase
import Fixture.compilerUtils.ParserUtils
import com.opticdev.core.compiler.stages.GeneratorFactoryStage
import com.opticdev.core.sdk.descriptions.{CodeComponent, Lens}
import com.opticdev.core.sdk.descriptions.enums.ComponentEnums.{Literal, Token}
import com.opticdev.core.sdk.descriptions.enums.FinderEnums.{Containing, Entire}
import com.opticdev.core.sdk.descriptions.enums.Finders.StringFinder
import play.api.libs.json.{JsObject, JsString}
import com.opticdev.core.sourcegear.gears.RuleProvider

class GeneratorFactoryStageTest extends TestBase with ParserUtils{

  describe("Generator Factory") {

    implicit val lens : Lens = Lens("Example", null, null, null, null)
    val block = "var hello = require('world')"

    implicit val ruleProvider = new RuleProvider()

    val parseGear = parseGearFromSnippetWithComponents(block, Vector(
      CodeComponent(Token, "definedAs", StringFinder(Entire, "hello")),
      CodeComponent(Literal, "pathTo", StringFinder(Containing, "world"))
    ))

    val importSample = sample(block)

    it("Can create a generator") {
      val generator = new GeneratorFactoryStage(importSample, parseGear).run.generateGear
      val result = generator.generate(JsObject(Seq("definedAs" -> JsString("VARIABLE"), "pathTo" -> JsString("PATH"))))
      assert(result == "var VARIABLE = require('PATH')")
    }

  }

}
