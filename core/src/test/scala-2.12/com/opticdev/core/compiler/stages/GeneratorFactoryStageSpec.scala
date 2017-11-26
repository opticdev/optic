package com.opticdev.core.compiler.stages

import better.files.File
import com.opticdev.core.actorSystem
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.ParserUtils
import com.opticdev.core.compiler.stages.GeneratorFactoryStage
import com.opticdev.sdk.descriptions.{CodeComponent, Lens}
import com.opticdev.sdk.descriptions.enums.ComponentEnums.{Literal, Token}
import com.opticdev.sdk.descriptions.enums.FinderEnums.{Containing, Entire}
import com.opticdev.sdk.descriptions.finders.StringFinder
import com.opticdev.core.sourcegear.{GearSet, SourceGear}
import play.api.libs.json.{JsObject, JsString}
import com.opticdev.core.sourcegear.gears.RuleProvider
import com.opticdev.core.sourcegear.project.{Project, StaticSGProject}
import com.opticdev.parsers.{ParserBase, SourceParserManager}

class GeneratorFactoryStageSpec extends AkkaTestFixture("GeneratorFactoryStageTest") with ParserUtils {

  implicit val lens : Lens = Lens("Example", null, null, null, null)

  val block = "var hello = require('world')"
  implicit val ruleProvider = new RuleProvider()

  implicit val sourceGear = new SourceGear {
    override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
    override val gearSet = new GearSet()
    override val schemas = Set()
  }

  implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), sourceGear)

  val parseGear = parseGearFromSnippetWithComponents(block, Vector(
    CodeComponent(Token, "definedAs", StringFinder(Entire, "hello")),
    CodeComponent(Literal, "pathTo", StringFinder(Containing, "world"))
  ))

  val importSample = sample(block)

  it("can create a generator") {
    val generator = new GeneratorFactoryStage(importSample, parseGear).run.generateGear
    val result = generator.generate(JsObject(Seq("definedAs" -> JsString("VARIABLE"), "pathTo" -> JsString("PATH"))))
    assert(result == "var VARIABLE = require('PATH')")
  }


}
