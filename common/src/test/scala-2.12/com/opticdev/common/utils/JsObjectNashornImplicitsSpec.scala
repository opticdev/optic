package com.opticdev.common.utils

import javax.script.ScriptEngineManager

import org.scalatest.FunSpec
import play.api.libs.json.{JsNumber, JsObject}
import jdk.nashorn.api.scripting.{NashornScriptEngine, ScriptObjectMirror}
import JsObjectNashornImplicits._

class JsObjectNashornImplicitsSpec extends FunSpec {

  implicit val engine: NashornScriptEngine = new ScriptEngineManager(null).getEngineByName("nashorn").asInstanceOf[NashornScriptEngine]

  val testJsObject = JsObject(Seq("a" -> JsNumber(1), "b"-> JsNumber(2), "c" -> JsNumber(26)))

  it("JsObject -> ScriptObject") {

    val asScriptObject = testJsObject.asScriptObject

    assert(asScriptObject.isSuccess)
    assert(asScriptObject.get.entrySet().size() == 3)

  }

  it("ScriptObject -> JsObject") {

    val asScriptObject = testJsObject.asScriptObject.get

    val asJsObject = asScriptObject.asJsObject

    assert(asJsObject.isSuccess)
    assert(asJsObject.get.fields.size == 3)

  }


}
