package com.opticdev.sdk.transformation

import com.opticdev.sdk.descriptions.SchemaRef
import com.opticdev.sdk.descriptions.transformation.{ProcessResult, SingleModel, StagedNode, Transformation, TransformationResult}
import jdk.nashorn.api.scripting.ScriptObjectMirror
import org.scalatest.FunSpec
import play.api.libs.json.{JsBoolean, JsObject, Json}
import com.opticdev.sdk.descriptions.transformation._
class ProcessResultSpec extends FunSpec {

  implicit val outputSchemaRef = SchemaRef.fromString("test:package/schema").get

  describe("for scriptobjects") {
    implicit val engine = Transformation.engine

    it("will fail if non object response") {
      val test: AnyRef = engine.eval("'Hello World'")
      assert(ProcessResult.objectResultFromScriptObject(test).isFailure)
    }

    it("will work for an object response") {
      val test: AnyRef = engine.eval("(function () { return {time: 'now'} })()")
      assert(ProcessResult.objectResultFromScriptObject(test).isSuccess)
    }
  }

  it("will return SingleModel for a model return") {
    val obj = JsObject(Seq("test" -> JsBoolean(true)))
    assert(ProcessResult.objectResult(obj).get == SingleModel(outputSchemaRef, obj))
  }

  it("will return a staged node for a generate call") {
    val stagedNode = StagedNode(SchemaRef.fromString("hello:test/schema").get, JsObject.empty, None)
    val asJson = Json.toJson[StagedNode](stagedNode)
    assert(ProcessResult.objectResult(asJson.as[JsObject]).get == stagedNode)
  }

}
