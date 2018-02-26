package com.opticdev.sdk.descriptions

import javax.script.{CompiledScript, ScriptEngineManager}

import com.opticdev.common.PackageRef
import jdk.nashorn.api.scripting.{NashornScriptEngine, ScriptObjectMirror}
import play.api.libs.json._

import scala.util.Try


object Transformation extends Description[Transformation] {

  val engine: NashornScriptEngine = new ScriptEngineManager(null).getEngineByName("nashorn").asInstanceOf[NashornScriptEngine]

  import Schema._

  implicit val transformationReads = Json.reads[Transformation]

  override def fromJson(jsValue: JsValue) = {
    val transformation = Json.fromJson[Transformation](jsValue)

    if (transformation.isSuccess) {
      transformation.get
    } else {
      throw new Error("Transformation Parsing Failed "+transformation)
    }

  }

}

class TransformFunction(code: String) {
  lazy val inflated: Try[ScriptObjectMirror] = Try {
      val evalString = s"""(function () {
      | var transform = ${code}
      | return transform
      | })() """.stripMargin

    val evaled = Transformation.engine.eval(evalString).asInstanceOf[ScriptObjectMirror]
    if (evaled.isFunction) evaled else throw new Error("Transform must be a function")
  }

  def transform(jsObject: JsObject) = {

  }

}

sealed trait TransformationBase extends PackageExportable {
  def code: String
  val transformFunction = new TransformFunction(code)
}
//case class InlineTransformation() extends TransformationBase

case class Transformation( inputSchema: SchemaRef,
                           outputSchema: SchemaRef,
                           code: String) extends TransformationBase