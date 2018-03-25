package com.opticdev.core.sourcegear

import com.opticdev.common.PackageRef
import com.opticdev.core.Fixture.compilerUtils.{GearUtils, ParserUtils}
import com.opticdev.core.Fixture.{DummyCompilerOutputs, ExampleSourcegearFixtures, TestBase}
import com.opticdev.core.compiler.stages.RenderFactoryStage
import com.opticdev.parsers.{ParserBase, SourceParserManager}
import com.opticdev.sdk.RenderOptions
import com.opticdev.sdk.descriptions.enums.FinderEnums.{Containing, Entire}
import com.opticdev.sdk.descriptions.enums.RuleEnums.SameAnyOrderPlus
import com.opticdev.sdk.descriptions.finders.StringFinder
import com.opticdev.sdk.descriptions._
import com.opticdev.sdk.descriptions.enums.{RuleEnums, VariableEnums}
import com.opticdev.sdk.descriptions.transformation.{StagedNode, Transformation}
import org.scalatest.PrivateMethodTester
import play.api.libs.json.{JsObject, JsString}

class RenderSpec extends TestBase with PrivateMethodTester with GearUtils with ParserUtils {
  describe("uses the proper gear") {

    lazy val testSchemaRef = SchemaRef.fromString("test:schemas/a").get

    lazy val a = Gear("test", "test", testSchemaRef, Set(), DummyCompilerOutputs.parser, DummyCompilerOutputs.render)
    lazy val b = Gear("other", "test", testSchemaRef, Set(), DummyCompilerOutputs.parser, DummyCompilerOutputs.render)


    val sourceGear = new SourceGear {
      override val parsers: Set[ParserBase] = Set()
      override val gearSet: GearSet = new GearSet(a, b)
      override val transformations: Set[Transformation] = Set()
      override val schemas: Set[Schema] = Set()
    }

    lazy val resolveGear = PrivateMethod[Option[Gear]]('resolveGear)

    it("if set in options") {
      val stagedNode = StagedNode(testSchemaRef, JsObject.empty, Some(RenderOptions(gearId = Some(a.id))))
      val result = Render invokePrivate resolveGear(stagedNode, sourceGear)
      assert(result.contains(a))
    }

    it("if not set in options gets first matching") {
      val stagedNode = StagedNode(testSchemaRef, JsObject.empty)
      val result = Render invokePrivate resolveGear(stagedNode, sourceGear)
      assert(result.contains(a))
    }

    it("will return none if gear is not found") {
      val stagedNode = StagedNode(testSchemaRef, JsObject.empty, Some(RenderOptions(gearId = Some("FAKE"))))
      val result = Render invokePrivate resolveGear(stagedNode, sourceGear)
      assert(result.isEmpty)
    }

  }

  it("can render a flat node") {

    implicit val sourceGear = sourceGearFromDescription("test-examples/resources/example_packages/optic:ImportExample@0.1.0.json")

    val result = Render.simpleNode(sourceGear.schemas.head.schemaRef, JsObject(
      Seq("definedAs" -> JsString("ABC"), "pathTo" -> JsString("DEF"))
    ))

    assert(result.get._2 == """let ABC = require('DEF')""")

  }

  it("can render node with nested gears and variables") {

    import ExampleSourcegearFixtures._
    val f = routeQueryResponse

    val queryValue = JsObject(Seq(
      "fields" -> JsObject(Seq("fieldA" -> JsObject(Seq("_valueFormat" -> JsString("code"), "value" -> JsString("req.query.fieldA")))))
    ))

    val stagedNode = StagedNode(f.routeGear.schemaRef, JsObject.empty, Some(RenderOptions(
      variables = Some(Map("request" -> "req", "response" -> "res")),
      containers = Some(Map("callback" -> Seq(
        StagedNode(f.queryGear.schemaRef, queryValue, Some(RenderOptions(
          containers = Some(Map(
            "success" -> Seq(
              StagedNode(f.responseGear.schemaRef, JsObject.empty)
            )
          ))
        )))
      )))
    )))
    val result = Render.fromStagedNode(stagedNode)(f.sourceGear)

    println(result.get._2)
  }

  it("will replace staged nodes in value with generated code") {
    lazy val processValue = PrivateMethod[JsObject]('processValue)




  }

}
