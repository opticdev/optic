package com.opticdev.sdk.transformation

import com.opticdev.common.PackageRef
import com.opticdev.sdk.descriptions.SchemaRef
import com.opticdev.sdk.descriptions.transformation.{SingleModel, TransformFunction, Transformation}
import org.scalatest.FunSpec
import play.api.libs.json.{JsBoolean, JsObject, JsString, Json}

import scala.util.Success
class SdkTransformationSpec extends FunSpec {

  implicit val outputSchemaRef = SchemaRef.fromString("test:package/schema").get

  val validTransformationJson =
    """
      |{
          "name": "Schema from Test",
          "packageId": "optic:test@1.0.0/schema",
          "input": "optic:test@1.0.0/schema",
          "output": "test",
          "ask": {"type": "object"},
          "script": "const parser = ()=> {}"
      |		}
    """.stripMargin

  val invalidTransformationJson = """{ "name": "hello world" }"""

  describe("parser") {

    it("works when valid") {
      val result = Transformation.fromJson(Json.parse(validTransformationJson))
      assert(result.name == "Schema from Test")
      assert(result.input == SchemaRef(PackageRef("optic:test", "1.0.0"), "schema"))
      assert(result.output == SchemaRef(null, "test"))
    }

    it("fails when invalid") {
      assertThrows[Error] {
        Transformation.fromJson(Json.parse(invalidTransformationJson))
      }
    }

  }

  describe("Transform Function") {

    val valid = new TransformFunction(
      """
        |function(a) {
        | return {hello: a.test}
        |}
      """.stripMargin)

    it("can inflate code to script objects") {
      val inflated = valid.inflated
      assert(inflated.isSuccess)
    }

    it("will fail it is not a function ") {
      assert(new TransformFunction("'Hello World'").inflated.isFailure)
    }

    it("can execute a transformation") {
      val result = valid.transform(JsObject(Seq("test" -> JsString("world"))), JsObject.empty)
      assert(result == Success(SingleModel(outputSchemaRef, JsObject(Seq("hello" -> JsString("world"))))))
    }

    describe("receives answers from Ask") {
      val valid = new TransformFunction(
        """
          |function(input, answers) {
          | return {hello: answers.value}
          |}
        """.stripMargin, Json.parse("""{"type": "object", "properties": { "value": { "type": "string" } }}""").as[JsObject])

      it("when valid answers object passed") {
        val result = valid.transform(JsObject.empty, JsObject(Seq("value" -> JsString("world"))))
        assert(result == Success(SingleModel(outputSchemaRef, JsObject(Seq("hello" -> JsString("world"))))))
      }

      it("will fail when invalid answers object is input") {
        val result = valid.transform(JsObject.empty, JsObject(Seq("value" -> JsBoolean(false))))
        assert(result.isFailure)
      }


    }

  }

}
