package com.opticdev.common.utils

import jdk.nashorn.api.scripting.{NashornScriptEngine, ScriptObjectMirror}
import play.api.libs.json.{JsArray, JsObject, JsValue, Json}

import scala.util.Try

object JsObjectNashornImplicits {

  implicit class JsObjectToNashorn(jsObject: JsObject)(implicit val engine: NashornScriptEngine) {
    def asScriptObject : Try[ScriptObjectMirror] = Try {

      val removeReservedFields = JsonUtils.removeReservedFields(jsObject)

      //@todo there's probably a faster/better way to do this but its infrequently called so not worth the work now
      val evalString = s"""(function () {
                          | var obj = ${removeReservedFields.toString()}
                          | return obj
                          | })() """.stripMargin

      engine.eval(evalString).asInstanceOf[ScriptObjectMirror]
    }
  }

  implicit class ScriptObjectToJsObject(scriptObjectMirror: ScriptObjectMirror)(implicit val engine: NashornScriptEngine) {
    def asJsObject : Try[JsObject] = Try {
      val json = engine.eval("JSON").asInstanceOf[ScriptObjectMirror]
      val asJsObject = Json.parse(json.callMember("stringify", scriptObjectMirror).asInstanceOf[String]).as[JsObject]
      asJsObject
    }
  }


}
