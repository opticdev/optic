package com.opticdev.sdk.transformation

import com.opticdev.common.PackageRef
import com.opticdev.sdk.descriptions.SchemaRef
import com.opticdev.sdk.descriptions.transformation.{SingleModel, TransformFunction, Transformation}
import org.scalatest.FunSpec
import play.api.libs.json.{JsObject, JsString, Json}

import scala.util.Success
class SdkTransformationSpec extends FunSpec {

  val validTransformationJson =
    """
      |{
          "name": "Schema from Test",
          "packageId": "optic:test@1.0.0/schema",
          "input": "optic:test@1.0.0/schema",
          "output": "test",
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
      val result = valid.transform(JsObject(Seq("test" -> JsString("world"))))
      assert(result == Success(SingleModel(JsObject(Seq("hello" -> JsString("world"))))))
    }

  }

}
