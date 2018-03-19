package com.opticdev.sdk.descriptions.transformation

import jdk.nashorn.api.scripting.{NashornScriptEngine, ScriptObjectMirror}
import play.api.libs.json.{JsObject, Json}

import scala.util.{Success, Try}
import com.opticdev.common.utils.JsObjectNashornImplicits._

object ProcessResult {
  def objectResult(jsObject: JsObject): Try[TransformationResult] = Try {

    lazy val stagedNodeOption = Json.fromJson[StagedNode](jsObject)

    jsObject match {
      case result if stagedNodeOption.isSuccess => stagedNodeOption.get
      case _ => SingleModel(jsObject)
    }

  }

  def objectResultFromScriptObject(obj: AnyRef)(implicit engine: NashornScriptEngine) : Try[TransformationResult] = Try {

    obj match {
      case mirror: ScriptObjectMirror =>
        mirror.asJsObject.flatMap(objectResult).get
      case a: AnyRef => {
        throw new Exception(s"Transformation function must return an object. Type ${a.getClass} found")
      }
    }

  }

}
