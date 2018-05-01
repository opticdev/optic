package com.opticdev.core.sourcegear.objects.annotations

import com.opticdev.common.PackageRef
import com.opticdev.core.Fixture.TestBase
import com.opticdev.parsers.graph.CommonAstNode
import com.opticdev.parsers.{ParserRef, SourceParserManager}
import com.opticdev.sdk.descriptions.SchemaRef
import com.opticdev.sdk.descriptions.transformation.TransformationRef
import org.scalatest.FunSpec

import scala.util.Try

class ObjectAnnotationParserSpec extends TestBase {

  it("can generate the proper annotation regex from parser") {
    val matches = ObjectAnnotationParser.annotationRegex("//").findAllIn("code //hello //world")
    assert(matches.toVector.head == "//hello //world")
  }

  describe("extract annotation values") {

    it("works for single key") {
      val map = ObjectAnnotationParser.extractRawAnnotationsFromLine("name: Test Name")
      assert(map == Map("name" -> StringValue("Test Name")))
    }

    it("works for multiple keys") {
      val map = ObjectAnnotationParser.extractRawAnnotationsFromLine("name: Test Name, source: Other")
      assert(map == Map("name" -> StringValue("Test Name"), "source" -> StringValue("Other")))
    }

    it("last assignment wins") {
      val map = ObjectAnnotationParser.extractRawAnnotationsFromLine("name: Test Name, source: Other, name: second")
      assert(map == Map("name" -> StringValue("second"), "source" -> StringValue("Other")))
    }

    it("invalid annotation returns empty map") {
      val map = ObjectAnnotationParser.extractRawAnnotationsFromLine("NA  ME: Test Name, source: Other")
      assert(map.isEmpty)
    }

    it("can extract expressions") {
      val map = ObjectAnnotationParser.extractRawAnnotationsFromLine("source: TEST IDEA -> optic:test/transform")
      assert(map == Map("source" -> ExpressionValue("TEST IDEA", TransformationRef(Some(PackageRef("optic:test")), "transform"), None)))
    }

  }


  describe("extracting from model") {

    val testSchema = SchemaRef(Some(PackageRef("test:package")), "test")

    it("will extract annotations on the first line of a model") {
      val a = ObjectAnnotationParser.extract("test.code('thing') //name: Model", testSchema, "//")
      assert(a.size == 1)
      assert(a.head == NameAnnotation("Model", testSchema))
    }

  }

  describe("choosing contents to check") {
    it("works for one liner") {
      val test = "thing.model() //name: Here"
      val contentsToCheck = ObjectAnnotationParser.contentsToCheck(CommonAstNode(null, Range(0, 13), null))(test)
      assert(contentsToCheck == test)
    }

    it("works for multi liner") {
      val test = "thing.model() //name: Here \n\n otherLine() \n line()"
      val contentsToCheck = ObjectAnnotationParser.contentsToCheck(CommonAstNode(null, Range(0, 50), null))(test)
      assert(contentsToCheck == test)
    }
  }

}
