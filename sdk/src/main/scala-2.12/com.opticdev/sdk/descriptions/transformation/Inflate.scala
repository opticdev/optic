package com.opticdev.sdk.descriptions.transformation

import jdk.nashorn.api.scripting.ScriptObjectMirror

import scala.util.Try

object Inflate {
  import com.opticdev.common.utils.JsObjectNashornImplicits._
  private implicit val engine = Transformation.engine

  def fromString(code: String) : Try[ScriptObjectMirror] = Try {
    val evalString = s"""(function () {
                        | var transform = ${code}
                        | return transform
                        | })() """.stripMargin

    val evaled = Transformation.engine.eval(evalString).asInstanceOf[ScriptObjectMirror]
    if (evaled.isFunction) evaled else throw new Error("Transform must be a function")
  }
}
