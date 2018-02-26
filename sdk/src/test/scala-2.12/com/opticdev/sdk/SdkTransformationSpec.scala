package com.opticdev.sdk

import com.opticdev.common.PackageRef
import org.scalatest.FunSpec
import play.api.libs.json.Json
import com.opticdev.sdk.descriptions.{SchemaRef, TransformFunction, Transformation}
class SdkTransformationSpec extends FunSpec {

  val validTransformationJson =
    """
      |{
          "inputSchema": "optic:test@1.0.0/schema",
          "outputSchema": "test",
          "code": "const parser = ()=> {}"
      |		}
    """.stripMargin

  val invalidTransformationJson = """{ "name": "hello world" }"""

  describe("parser") {

    it("works when valid") {
      val result = Transformation.fromJson(Json.parse(validTransformationJson))
      assert(result.inputSchema == SchemaRef(PackageRef("optic:test", "1.0.0"), "schema"))
      assert(result.outputSchema == SchemaRef(null, "test"))
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
        |function(a, b) {
        | return "HELLO WORLD"
        |}
      """.stripMargin)

    it("can inflate code to script objects") {
      val inflated = valid.inflated
      assert(inflated.isSuccess)
    }

    it("will fail code it is not syntactically valid") {
      assert(new TransformFunction("_dasd dd+( ").inflated.isFailure)
    }

    it("will fail it is not a function ") {
      assert(new TransformFunction("'Hello World'").inflated.isFailure)
    }


  }

}
