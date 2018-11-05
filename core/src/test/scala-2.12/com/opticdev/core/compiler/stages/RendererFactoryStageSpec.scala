package com.opticdev.core.compiler.stages

import better.files.File
import com.opticdev.common.{PackageRef, SchemaRef}
import com.opticdev.core.actorSystem
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.{GearUtils, ParserUtils}
import com.opticdev.sdk.descriptions._
import com.opticdev.sdk.descriptions.enums.FinderEnums.{Containing, Entire}
import com.opticdev.core.sourcegear.{CompiledLens, LensSet, SourceGear}
import play.api.libs.json.{JsArray, JsObject, JsString}
import com.opticdev.core.sourcegear.gears.RuleProvider
import com.opticdev.core.sourcegear.project.{Project, StaticSGProject}
import com.opticdev.parsers.{ParserBase, SourceParserManager}
import com.opticdev.core._
import com.opticdev.core.sourcegear.context.FlatContext
import com.opticdev.core.sourcegear.graph.ProjectGraph
import com.opticdev.parsers.graph.AstType
import com.opticdev.parsers.rules._
import com.opticdev.sdk.descriptions.transformation.generate.StagedNode
import com.opticdev.sdk.skills_sdk.lens
import com.opticdev.sdk.skills_sdk.lens._
import com.opticdev.sdk.skills_sdk.schema.OMSchema

class RendererFactoryStageSpec extends AkkaTestFixture("RendererFactoryStageSpec") with ParserUtils with GearUtils {

  it("can create an expression renderer") {

    val block = "my.hello.world"

    implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), sourceGear)

    implicit val (parseGear, lens) = parseGearFromSnippetWithComponents(block, Map(
      "test" -> OMLensCodeComponent(Token, OMStringFinder(Entire, "hello")),
      "testA" -> OMLensCodeComponent(Token, OMStringFinder(Entire, "world"))
    ))

    val importSample = sample(block)

    val renderer = new RenderFactoryStage(importSample, parseGear).run.renderGear
    val result = renderer.render(JsObject(Seq("test" -> JsString("world"), "testA" -> JsString("hello"))))
    assert(result == "my.world.hello")

  }

  it("can create a simple renderer") {

    val block = "var hello = require('world')"

    implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), sourceGear)

    implicit val (parseGear, lens) = parseGearFromSnippetWithComponents(block, Map(
      "definedAs" -> OMLensCodeComponent(Token, OMStringFinder(Entire, "hello")),
      "pathTo" -> OMLensCodeComponent(Literal, OMStringFinder(Containing, "world"))
    ))

    val importSample = sample(block)

    val renderer = new RenderFactoryStage(importSample, parseGear).run.renderGear
    val result = renderer.render(JsObject(Seq("definedAs" -> JsString("VARIABLE"), "pathTo" -> JsString("PATH"))))
    assert(result == "var VARIABLE = require('PATH')")

  }

  lazy val callbackFixture = new {
    val childGear = {
      val block = "start(thing)"
      implicit val (parseGear, lens) = parseGearFromSnippetWithComponents(block, Map(
        "operation" -> OMLensCodeComponent(Token, OMStringFinder(Entire, "thing"))
      ))

      val renderer = new RenderFactoryStage(sample(block), parseGear).run.renderGear

      CompiledLens(Some("do"), "do", PackageRef.fromString("optic:test").get, Left(SchemaRef(Some(PackageRef("optic:test", "0.1.1")), "a")), Set(AstType("CallExpression", "es7")), parseGear, renderer, 1)
    }

    val block =
      """call("value", function () {
        | //:callback
        |})""".stripMargin

    implicit val (parseGear, lens) = parseGearFromSnippetWithComponents(block, Map(
      "arg1" ->  OMLensCodeComponent(Literal, OMStringFinder(Containing, "value")),
      "properties" -> OMLensSchemaComponent(childGear.schemaRef, true, None, Some("callback"))
    ), subContainers = Map(
      "callback" -> Any
    ))


    val parsedSample = sample(block)
    val result = parseGear.matches(parsedSample.entryChildren.head)(parsedSample.astGraph, block, sourceGearContext, null)

    val renderer = new RenderFactoryStage(sample(block), parseGear).run.renderGear

    val thisGear = CompiledLens(Some("wrapper"), "wrapper", PackageRef.fromString("optic:test").get, Left(SchemaRef(Some(PackageRef("optic:test", "0.1.1")), "b")), Set(AstType("CallExpression", "es7")), parseGear, renderer, 1)

    val a = OMSchema(SchemaRef(Some(PackageRef("optic:test", "0.1.1")), "b"), JsObject.empty)
    val b = OMSchema(SchemaRef(Some(PackageRef("optic:test", "0.1.1")), "a"), JsObject.empty)

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
      override val connectedProjectGraphs: Set[ProjectGraph] = Set()
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

    implicit val (parseGear, lens) = parseGearFromSnippetWithComponents(block, Map(
      "name" ->  OMLensCodeComponent(Token, OMStringFinder(Entire, "thing"))
    ), variables = Map("variable" -> Self))

    val importSample = sample(block)

    val renderer = new RenderFactoryStage(importSample, parseGear).run.renderGear
    val result = renderer.render(JsObject(Seq("name" -> JsString("OTHER"))),
      variableMapping = Map("variable" -> "v_name")
    )
    assert(result == "const v_name = function OTHER() {}")

  }

}
