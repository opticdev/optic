package com.opticdev.core.compiler.stages

import better.files.File
import com.opticdev.common.PackageRef
import com.opticdev.core.actorSystem
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.{GearUtils, ParserUtils}
import com.opticdev.sdk.descriptions._
import com.opticdev.sdk.descriptions.enums.FinderEnums.{Containing, Entire}
import com.opticdev.sdk.descriptions.finders.StringFinder
import com.opticdev.core.sourcegear.{Gear, GearSet, SourceGear}
import play.api.libs.json.{JsArray, JsObject, JsString}
import com.opticdev.core.sourcegear.gears.RuleProvider
import com.opticdev.core.sourcegear.project.{Project, StaticSGProject}
import com.opticdev.parsers.{ParserBase, SourceParserManager}
import com.opticdev.core._
import com.opticdev.sdk.descriptions.enums.RuleEnums.SameAnyOrderPlus

class RendererFactoryStageSpec extends AkkaTestFixture("RendererFactoryStageSpec") with ParserUtils with GearUtils {

  it("can create a simple renderer") {

    val block = "var hello = require('world')"
    implicit val ruleProvider = new RuleProvider()

    implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), sourceGear)

    implicit val (parseGear, lens) = parseGearFromSnippetWithComponents(block, Vector(
      CodeComponent(Seq("definedAs"), StringFinder(Entire, "hello")),
      CodeComponent(Seq("pathTo"), StringFinder(Containing, "world"))
    ))

    val importSample = sample(block)

    val renderer = new RenderFactoryStage(importSample, parseGear).run.generateGear
    val result = renderer.render(JsObject(Seq("definedAs" -> JsString("VARIABLE"), "pathTo" -> JsString("PATH"))))
    assert(result == "var VARIABLE = require('PATH')")
  }

  it("can create a renderer for node with sub-containers") {

    val childGear = {
      val block = "start(thing)"
      implicit val (parseGear, lens) = parseGearFromSnippetWithComponents(block, Vector(
        CodeComponent(Seq("operation"), StringFinder(Entire, "thing"))
      ))

      val renderer = new RenderFactoryStage(sample(block), parseGear).run.generateGear

      Gear("do", "optic:test", SchemaRef(PackageRef("optic:test"), "a"), Set(), parseGear, renderer)
    }

    val block =
      """call("value", function () {
        | //:callback
        |})""".stripMargin

    implicit val (parseGear, lens) = parseGearFromSnippetWithComponents(block, Vector(
      CodeComponent(Seq("arg1"), StringFinder(Containing, "value"))
    ), subContainers = Vector(
      SubContainer("callback", Vector(), SameAnyOrderPlus, Vector(
        SchemaComponent(Seq("properties"), childGear.schemaRef, true, None)
      ))
    ))

    val renderer = new RenderFactoryStage(sample(block), parseGear).run.generateGear

    val thisGear = Gear("wrapper", "optic:test", SchemaRef(PackageRef("optic:test"), "b"), Set(), parseGear, renderer)

    implicit val sourceGear = new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
      override val gearSet = new GearSet(thisGear, childGear)
      override val schemas = Set()
      override val transformations = Set()
    }


    val result = renderer.render(JsObject(Seq("arg1" -> JsString("TEST VARIABLE"),
      "properties" -> JsArray(Seq(
        JsObject(Seq("operation" -> JsString("first"))),
        JsObject(Seq("operation" -> JsString("second"))),
        JsObject(Seq("operation" -> JsString("third"))),
      ))
    )))

    val expected = """call("TEST VARIABLE", function () {
                     |  start(first)
                     |  start(second)
                     |  start(third)
                     |})""".stripMargin

    assert(result == expected)

  }


}
