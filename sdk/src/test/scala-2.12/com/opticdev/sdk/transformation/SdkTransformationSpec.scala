package com.opticdev.sdk.transformation

import akka.actor.ActorSystem
import better.files.File
import com.opticdev.common.PackageRef
import com.opticdev.sdk.descriptions.SchemaRef
import com.opticdev.sdk.descriptions.transformation.generate.SingleModel
import com.opticdev.sdk.descriptions.transformation.{TransformFunction, Transformation, TransformationCaller}
import jdk.nashorn.api.scripting.ScriptObjectMirror
import org.scalatest.FunSpec
import play.api.libs.json._

import scala.concurrent.Await
import scala.util.Success
class SdkTransformationSpec extends FunSpec {

  implicit val outputSchemaRef = SchemaRef.fromString("test:package/schema").get

  val validTransformationJson =
    """
      |{
          "yields": "Schema from Test",
          "id": "theid",
          "packageId": "optic:test@1.0.0/schema",
          "input": "optic:test@1.0.0/schema",
          "output": "test",
          "ask": {"type": "object"},
          "dynamicAsk": {
            "key": {
                "description": "example",
                "func": "function (input) { return {} }"
             }
          },
          "script": "const parser = ()=> {}"
      |		}
    """.stripMargin

  val invalidTransformationJson = """{ "name": "hello world" }"""

  describe("parser") {

    it("works when valid") {
      val result = Transformation.fromJson(Json.parse(validTransformationJson))
      assert(result.yields == "Schema from Test")
      assert(result.id == "theid")
      assert(result.ask.fields.size == 1)
      assert(result.dynamicAsk.fields.size == 1)
      assert(result.input == SchemaRef(Some(PackageRef("optic:test", "1.0.0")), "schema"))
      assert(result.output == Some(SchemaRef(None, "test")))
    }

    it("fails when invalid") {
      assertThrows[Error] {
        Transformation.fromJson(Json.parse(invalidTransformationJson))
      }
    }

    it("works when on dynamic ask specified") {

      val backwardsCompadibleNoDynamicAsk =
        """
      |{
          "yields": "Schema from Test",
          "id": "theid",
          "packageId": "optic:test@1.0.0/schema",
          "input": "optic:test@1.0.0/schema",
          "output": "test",
          "ask": {"type": "object"},
          "script": "const parser = ()=> {}"
      |		}
    """.stripMargin

       Transformation.fromJson(Json.parse(backwardsCompadibleNoDynamicAsk))
    }

  }

  describe("Transform Function") {

    val valid = new TransformFunction(
      """
        |function(a) {
        | return {hello: a.test}
        |}
      """.stripMargin, JsObject.empty, JsObject.empty, SchemaRef.fromString("tdasd:fdasdas/g").get, outputSchemaRef)

    val withDynamicAsk = new TransformFunction(
      """
        |function(a) {
        | return {hello: a.test}
        |}
      """.stripMargin,
      JsObject(Seq("first" -> JsNumber(1))),
      Json.parse(
        """{ "test": {"description": "value", "func": "function (input) { return input; }" },
          |  "test2": {"description": "value2", "func": "function (inputValue) { return inputValue; }" } }""".stripMargin).as[JsObject],
      SchemaRef.fromString("tdasd:fdasdas/g").get,
      outputSchemaRef)


    it("can inflate code to script objects") {
      val inflated = valid.inflated
      assert(inflated.isSuccess)
    }

    it("will fail it is not a function ") {
      assert(new TransformFunction("'Hello World'", JsObject.empty, JsObject.empty, SchemaRef.fromString("tdasd:fdasdas/g").get, outputSchemaRef).inflated.isFailure)
    }

    it("can execute a transformation") {
      val result = valid.transform(JsObject(Seq("test" -> JsString("world"))), JsObject.empty, null, None)
      assert(result == Success(SingleModel(outputSchemaRef, JsObject(Seq("hello" -> JsString("world"))))))
    }

    it("can collect dynamic ask") {
      assert(withDynamicAsk.dynamicAskSchemaInflated.size == 2)
    }

    it("can calculate combined schema of dynamic ask") {
      assert(withDynamicAsk.combinedAskSchema(JsObject(Seq("two" -> JsNumber(2)))) == Json.parse("""{"first":1,"test":{"two":2},"test2":{"two":2}}"""))
    }

    describe("receives answers from Ask") {
      val valid = new TransformFunction(
        """
          |function(input, answers) {
          | return {hello: answers.value}
          |}
        """.stripMargin, Json.parse("""{"type": "object", "properties": { "value": { "type": "string" } }}""").as[JsObject], JsObject.empty,
        SchemaRef.fromString("tdasd:fdasdas/g").get, outputSchemaRef)

      it("when valid answers object passed") {
        val result = valid.transform(JsObject.empty, JsObject(Seq("value" -> JsString("world"))), null, None)
        assert(result == Success(SingleModel(outputSchemaRef, JsObject(Seq("hello" -> JsString("world"))))))
      }

      it("will fail when invalid answers object is input") {
        val result = valid.transform(JsObject.empty, JsObject(Seq("value" -> JsBoolean(false))), null, None)
        assert(result.isFailure)
      }

    }

    describe("can lookup and execute other transformations") {

      lazy val caller = new TransformationCaller {
        override def get(id: String): ScriptObjectMirror = {
          if (id == "real") {
            valid.functionScriptObject.getOrElse(null)
          } else {
            null
          }
        }
      }

      it("when valid id") {
        val test = new TransformFunction(
          """
            |function(input, answers, modelId, transformations) {
            | return transformations.get('real')(input)
            |}
          """.stripMargin, JsObject.empty, JsObject.empty, SchemaRef.fromString("tdasd:fdasdas/fake").get, outputSchemaRef)

        val result = test.transform(JsObject(Seq("test" -> JsString("world"))), JsObject.empty, caller, None)
        assert(result == Success(SingleModel(outputSchemaRef, JsObject(Seq("hello" -> JsString("world"))))))
      }

      it("throws if not found") {
        val test = new TransformFunction(
          """
            |function(input, answers, modelId, transformations) {
            | return transformations.get('not_real')(input)
            |}
          """.stripMargin, JsObject.empty, JsObject.empty, SchemaRef.fromString("tdasd:fdasdas/fake").get, outputSchemaRef)

        val result = test.transform(JsObject.empty, JsObject.empty, caller, None)
        assert(result.isFailure)
      }

    }

  }

}
