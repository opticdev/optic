package com.opticdev.core.sourcegear.annotations

import com.opticdev.common.PackageRef
import com.opticdev.core.Fixture.TestBase
import com.opticdev.parsers.graph.CommonAstNode
import com.opticdev.parsers.{ParserRef, SourceParserManager}
import com.opticdev.common.SchemaRef
import com.opticdev.sdk.descriptions.transformation.TransformationRef
import org.scalatest.FunSpec
import play.api.libs.json.{JsNumber, JsObject, JsString}

import scala.util.Try

class AnnotationParserSpec extends TestBase {

  describe("extracting comments") {
    it("returns none when no comment found") {
      assert(AnnotationParser.findAnnotationComment("//", "hello.code()").isEmpty)
    }

    it("returns the last comment when found") {
      assert(AnnotationParser.findAnnotationComment("//", "hello.code('//hello') //realone").contains("//realone"))
    }
  }

  describe("extract annotation values") {

    it("works for single key") {
      val map = AnnotationParser.extractRawAnnotationsFromLine("name: Test Name")
      assert(map == Map("name" -> StringValue("Test Name")))
    }

    it("works for single key with special chars") {
      val map = AnnotationParser.extractRawAnnotationsFromLine("name: POST /test-route/:id")
      assert(map == Map("name" -> StringValue("POST /test-route/:id")))
    }

    it("last assignment wins") {
      val map = AnnotationParser.extractRawAnnotationsFromLine("name: Test Name, name: second")
      assert(map == Map("name" -> StringValue("second")))
    }

    it("invalid annotation returns empty map") {
      val map = AnnotationParser.extractRawAnnotationsFromLine("NA  ME: Test Name, source: Other")
      assert(map.isEmpty)
    }

    it("can extract expressions") {
      val map = AnnotationParser.extractRawAnnotationsFromLine("source: TEST IDEA -> optic:test/transform")
      assert(map == Map("source" -> ExpressionValue("TEST IDEA", TransformationRef(Some(PackageRef("optic:test")), "transform"), None)))
    }

  }


  describe("extracting from model") {

    val testSchema = SchemaRef(Some(PackageRef("test:package")), "test")

    it("will extract name annotations on the first line of a model") {
      val a = AnnotationParser.extract("test.code('thing') //name: Model", testSchema, "//")
      assert(a.size == 1)
      assert(a.head == NameAnnotation("Model", testSchema))
    }

    it("will extract source from a model") {
      val a = AnnotationParser.extract("test.code('thing') //source: User Model -> optic:mongoose@0.1.0/createroutefromschema {\"queryProvider\": \"optic:mongoose/insert-record\"}", testSchema, "//")
      assert(a.size == 1)
      assert(a.head == SourceAnnotation("User Model", TransformationRef(Some(PackageRef("optic:mongoose", "0.1.0")), "createroutefromschema"), Some(JsObject(Seq("queryProvider" -> JsString("optic:mongoose/insert-record"))))))
    }


    it("will extract tags from a model") {
      val a = AnnotationParser.extract("test.code('thing') //tag: query", testSchema, "//")
      assert(a.size == 1)
      assert(a.head == TagAnnotation("query", testSchema))
    }

  }

  describe("choosing contents to check") {
    it("works for one liner") {
      val test = "thing.model() //name: Here"
      val contentsToCheck = AnnotationParser.contentsToCheck(CommonAstNode(null, Range(0, 13), null))(test)
      assert(contentsToCheck == test)
    }

    it("works for multi liner") {
      val test = "thing.model() //name: Here \n\n otherLine() \n line()"
      val contentsToCheck = AnnotationParser.contentsToCheck(CommonAstNode(null, Range(0, 50), null))(test)
      assert(contentsToCheck == test)
    }
  }

  describe("file annotation extraction") {

    it("can extract a file name annotation when exists") {
      val example =
        """//filename: Test File
          |class Define() {
        """.stripMargin


      assert(AnnotationParser.extractFromFileContents(example, "//") == Set(FileNameAnnotation("Test File")))

    }

    it("will not find a filename if one  does not ecist") {
      val example =
        """class Define() {
        """.stripMargin

      assert(AnnotationParser.extractFromFileContents(example, "//") == Set())

    }

  }

}
