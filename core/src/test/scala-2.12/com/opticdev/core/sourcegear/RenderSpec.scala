package com.opticdev.core.sourcegear

import com.opticdev.core.Fixture.{DummyCompilerOutputs, TestBase}
import com.opticdev.parsers.ParserBase
import com.opticdev.sdk.descriptions.{Schema, SchemaRef}
import com.opticdev.sdk.descriptions.transformation.{StagedNode, Transformation, TransformationOptions}
import org.scalatest.PrivateMethodTester
import play.api.libs.json.JsObject

import scala.util.Success

class RenderSpec extends TestBase with PrivateMethodTester {


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
      val stagedNode = StagedNode(testSchemaRef, JsObject.empty, Some(TransformationOptions(gearId = Some(a.id))))
      val result = Render invokePrivate resolveGear(stagedNode, sourceGear)
      assert(result.contains(a))
    }

    it("if not set in options gets first matching") {
      val stagedNode = StagedNode(testSchemaRef, JsObject.empty)
      val result = Render invokePrivate resolveGear(stagedNode, sourceGear)
      assert(result.contains(a))
    }

    it("will return none if gear is not found") {
      val stagedNode = StagedNode(testSchemaRef, JsObject.empty, Some(TransformationOptions(gearId = Some("FAKE"))))
      val result = Render invokePrivate resolveGear(stagedNode, sourceGear)
      assert(result.isEmpty)
    }

  }

}
