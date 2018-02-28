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

  def fromJson(packageRef: PackageRef, jsValue: JsValue): Transformation = {
    fromJson(jsValue.as[JsObject] + ("packageId" -> JsString(packageRef.full)))
  }
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
  import com.opticdev.common.utils.JsObjectNashornImplicits._
  private implicit val engine = Transformation.engine
  lazy val inflated: Try[ScriptObjectMirror] = Try {
      val evalString = s"""(function () {
      | var transform = ${code}
      | return transform
      | })() """.stripMargin

    val evaled = Transformation.engine.eval(evalString).asInstanceOf[ScriptObjectMirror]
    if (evaled.isFunction) evaled else throw new Error("Transform must be a function")
  }

  def transform(jsObject: JsObject): Try[JsObject] = inflated.map(transformFunction => Try {
    val scriptObject = jsObject.asScriptObject.get
    val result = transformFunction.call(null, scriptObject).asInstanceOf[ScriptObjectMirror]
    result.asJsObject.get
  }).flatten

}

sealed trait TransformationBase extends PackageExportable {
  def script: String
  def input: SchemaRef
  def output: SchemaRef
  val transformFunction = new TransformFunction(script)
}
//case class InlineTransformation() extends TransformationBase

case class Transformation(name: String,
                          packageId: PackageRef,
                          input: SchemaRef,
                          output: SchemaRef,
                          script: String) extends TransformationBase