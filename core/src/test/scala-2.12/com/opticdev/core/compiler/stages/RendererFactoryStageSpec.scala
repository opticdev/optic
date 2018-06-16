package com.opticdev.core.compiler.stages

import better.files.File
import com.opticdev.common.{PackageRef, SchemaRef}
import com.opticdev.core.actorSystem
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.{GearUtils, ParserUtils}
import com.opticdev.sdk.descriptions._
import com.opticdev.sdk.descriptions.enums.FinderEnums.{Containing, Entire}
import com.opticdev.sdk.descriptions.finders.StringFinder
import com.opticdev.core.sourcegear.{CompiledLens, LensSet, SourceGear}
import play.api.libs.json.{JsArray, JsObject, JsString}
import com.opticdev.core.sourcegear.gears.RuleProvider
import com.opticdev.core.sourcegear.project.{Project, StaticSGProject}
import com.opticdev.parsers.{ParserBase, SourceParserManager}
import com.opticdev.core._
import com.opticdev.core.sourcegear.context.FlatContext
import com.opticdev.parsers.rules._
import com.opticdev.sdk.descriptions.enums.VariableEnums
import com.opticdev.sdk.descriptions.transformation.generate.StagedNode

class RendererFactoryStageSpec extends AkkaTestFixture("RendererFactoryStageSpec") with ParserUtils with GearUtils {

  it("can create an expression renderer") {

    val block = "my.hello.world"

    implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), sourceGear)

    implicit val (parseGear, lens) = parseGearFromSnippetWithComponents(block, Vector(
      CodeComponent(Seq("test"), StringFinder(Entire, "hello")),
      CodeComponent(Seq("testA"), StringFinder(Entire, "world"))
    ))

    val importSample = sample(block)

    println(importSample)

    val renderer = new RenderFactoryStage(importSample, parseGear).run.renderGear
    val result = renderer.render(JsObject(Seq("test" -> JsString("world"), "testA" -> JsString("hello"))))
    assert(result == "my.world.hello")

  }

  it("can create a simple renderer") {

    val block = "var hello = require('world')"

    implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), sourceGear)

    implicit val (parseGear, lens) = parseGearFromSnippetWithComponents(block, Vector(
      CodeComponent(Seq("definedAs"), StringFinder(Entire, "hello")),
      CodeComponent(Seq("pathTo"), StringFinder(Containing, "world"))
    ))

    val importSample = sample(block)

    val renderer = new RenderFactoryStage(importSample, parseGear).run.renderGear
    val result = renderer.render(JsObject(Seq("definedAs" -> JsString("VARIABLE"), "pathTo" -> JsString("PATH"))))
    assert(result == "var VARIABLE = require('PATH')")

  }

  lazy val callbackFixture = new {
    val childGear = {
      val block = "start(thing)"
      implicit val (parseGear, lens) = parseGearFromSnippetWithComponents(block, Vector(
        CodeComponent(Seq("operation"), StringFinder(Entire, "thing"))
      ))

      val renderer = new RenderFactoryStage(sample(block), parseGear).run.renderGear

      CompiledLens(Some("do"), "do", PackageRef.fromString("optic:test").get, SchemaRef(Some(PackageRef("optic:test", "0.1.1")), "a"), Set(), parseGear, renderer)
    }

    val block =
      """call("value", function () {
        | //:callback
        |})""".stripMargin

    implicit val (parseGear, lens) = parseGearFromSnippetWithComponents(block, Vector(
      CodeComponent(Seq("arg1"), StringFinder(Containing, "value"))
    ), subContainers = Vector(
      SubContainer("callback", Vector(), SameAnyOrderPlus, Vector(
        SchemaComponent(Seq("properties"), childGear.schemaRef, true, None, None)
      ))
    ))

    val renderer = new RenderFactoryStage(sample(block), parseGear).run.renderGear

    val thisGear = CompiledLens(Some("wrapper"), "wrapper", PackageRef.fromString("optic:test").get, SchemaRef(Some(PackageRef("optic:test", "0.1.1")), "b"), Set(), parseGear, renderer)

    val a = Schema(SchemaRef(Some(PackageRef("optic:test", "0.1.1")), "b"), JsObject.empty)
    val b = Schema(SchemaRef(Some(PackageRef("optic:test", "0.1.1")), "a"), JsObject.empty)

    val sourceGear : SourceGear = new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
      override val lensSet = new LensSet(thisGear, childGear)
      override val schemas = Set(a,b)
      override val transformations = Set()
      override val flatContext: FlatContext = FlatContext(None, Map(
        "optic:test" -> FlatContext(Some(PackageRef("optic:test", "0.1.1")), Map(
          thisGear.id -> thisGear,
          childGear.id -> childGear,
          a.schemaRef.id -> a,
          b.schemaRef.id -> b
        ))
      ))
    }
  }

  it("can create a renderer for node with sub-containers") {

    val f = callbackFixture
    implicit val sourceGear = f.sourceGear
    val result = f.renderer.render(JsObject(Seq("arg1" -> JsString("TEST VARIABLE"),
      "properties" -> JsArray(Seq(
        JsObject(Seq("operation" -> JsString("first"))),
        JsObject(Seq("operation" -> JsString("second"))),
        JsObject(Seq("operation" -> JsString("third")))
      ))
    )))(sourceGear, context = sourceGear.flatContext)

    println(result)

    val expected = """call("TEST VARIABLE", function () {
                     |  start(first)
                     |  start(second)
                     |  start(third)
                     |})""".stripMargin

    assert(result == expected)

  }

  it("can create a renderer for node with sub-containers and object properties") {

    val f = callbackFixture
    implicit val sourceGear = f.sourceGear
    val result = f.renderer.render(JsObject(Seq("arg1" -> JsString("TEST VARIABLE"),
      "properties" -> JsObject(Seq(
        "first" -> JsObject(Seq("operation" -> JsString("first"))),
        "second" -> JsObject(Seq("operation" -> JsString("second"))),
        "third" -> JsObject(Seq("operation" -> JsString("third"))),
        "_order" -> JsArray(Seq(JsString("first"), JsString("second"), JsString("third")))
      ))
    )))(sourceGear, context = sourceGear.flatContext)

    val expected = """call("TEST VARIABLE", function () {
                     |  start(first)
                     |  start(second)
                     |  start(third)
                     |})""".stripMargin

    assert(result == expected)

  }

  it("can create a renderer for node that explicitly fills subcontainers and array properties") {

    val f = callbackFixture
    implicit val sourceGear = f.sourceGear
    val result = f.renderer.render(JsObject(Seq("arg1" -> JsString("TEST VARIABLE"),
      "properties" -> JsArray(Seq(
        JsObject(Seq("operation" -> JsString("first"))),
        JsObject(Seq("operation" -> JsString("second"))),
        JsObject(Seq("operation" -> JsString("third"))),
      ))
    )), Map("callback" -> Seq(StagedNode(f.childGear.schemaRef, JsObject(Seq("operation" -> JsString("OVERride")))))))

    val expected = """call("TEST VARIABLE", function () {
                     |  start(OVERride)
                     |})""".stripMargin

    assert(result == expected)

  }


  it("can create a renderer that supports variables") {

    val block = "const variable = function thing() {}"

    implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), sourceGear)

    implicit val (parseGear, lens) = parseGearFromSnippetWithComponents(block, Vector(
      CodeComponent(Seq("name"), StringFinder(Entire, "thing")),
    ), variables = Vector(Variable("variable", VariableEnums.Self)))

    val importSample = sample(block)

    val renderer = new RenderFactoryStage(importSample, parseGear).run.renderGear
    val result = renderer.render(JsObject(Seq("name" -> JsString("OTHER"))),
      variableMapping = Map("variable" -> "v_name")
    )
    assert(result == "const v_name = function OTHER() {}")

  }

}
