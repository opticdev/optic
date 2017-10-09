package compiler.stages

import Fixture.{AkkaTestFixture, TestBase}
import Fixture.compilerUtils.ParserUtils
import better.files.File
import com.opticdev.core.compiler.stages.GeneratorFactoryStage
import com.opticdev.core.sdk.descriptions.{CodeComponent, Lens}
import com.opticdev.core.sdk.descriptions.enums.ComponentEnums.{Literal, Token}
import com.opticdev.core.sdk.descriptions.enums.FinderEnums.{Containing, Entire}
import com.opticdev.core.sdk.descriptions.enums.Finders.StringFinder
import com.opticdev.core.sourcegear.SourceGear
import play.api.libs.json.{JsObject, JsString}
import com.opticdev.core.sourcegear.gears.RuleProvider
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.parsers.{ParserBase, SourceParserManager}

class GeneratorFactoryStageTest extends AkkaTestFixture("GeneratorFactoryStageTest") with ParserUtils{

  describe("Generator Factory") {

    implicit val lens : Lens = Lens("Example", null, null, null, null)

    val block = "var hello = require('world')"
    implicit val ruleProvider = new RuleProvider()

    implicit val sourceGear = new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
    }

    implicit val project = new Project("test", File(getCurrentDirectory + "/src/test/resources/tmp/test_project/"), sourceGear)

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
