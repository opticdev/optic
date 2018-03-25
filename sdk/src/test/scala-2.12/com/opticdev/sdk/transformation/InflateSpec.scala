package com.opticdev.sdk.transformation

import com.opticdev.sdk.descriptions.transformation.{Inflate, TransformFunction, Transformation}
import jdk.nashorn.api.scripting.ScriptObjectMirror
import org.scalatest.FunSpec
import play.api.libs.json.{JsObject, JsString, Json}

import scala.util.{Success, Try}

class InflateSpec extends FunSpec {
  val valid =
    """
      |function(a) {
      | return {hello: a.test}
      |}
    """.stripMargin

  it("can inflate code to script objects") {
    val inflated = Inflate.fromString(valid)
    assert(inflated.isSuccess)
  }

  it("will fail code it is not syntactically valid") {
    assert(Inflate.fromString("_dasd dd+( ").isFailure)
  }

  it("will fail it is not a function ") {
    assert(Inflate.fromString("'Hello World'").isFailure)
  }

  describe("Transformation SDK") {
    def testFunction(string: String) = {
      import com.opticdev.common.utils.JsObjectNashornImplicits._
      implicit val engine = Transformation.engine
      lazy val fixture = Inflate.fromString(string)
      fixture.map(transformFunction => Try {
        val scriptObject = JsObject.empty.asScriptObject.get
        val result = transformFunction.call(null, scriptObject).asInstanceOf[ScriptObjectMirror]
        result.asJsObject.get
      }).flatten

    }

    it("generate function") {
      val output = testFunction("""function(a) { return Generate('test:schema', {bool: true}, {}) }""")
      assert(output.get == Json.parse("""{"schema":"test:schema","value":{"bool":true},"options":{}, "_isStagedNode": true}"""))
    }

    it("code function") {
      val output = testFunction("""function(a) { return Code("hello") }""")
      assert(output.get == Json.parse("""{"_valueFormat":"code","value": "hello"}"""))
    }

    it("token function") {
      val output = testFunction("""function(a) { return Token("hello") }""")
      assert(output.get == Json.parse("""{"_valueFormat":"token","value": "hello"}"""))
    }

  }

}
