package com.opticdev.sdk.descriptions.transformation

import javax.script.ScriptEngineManager

import com.opticdev.common.PackageRef
import com.opticdev.sdk.descriptions._
import jdk.nashorn.api.scripting.{NashornScriptEngine, ScriptObjectMirror}
import play.api.libs.json._

import scala.util.Try


object Transformation extends Description[Transformation] {

  val engine: NashornScriptEngine = new ScriptEngineManager(null).getEngineByName("nashorn").asInstanceOf[NashornScriptEngine]


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
  lazy val inflated: Try[ScriptObjectMirror] = Inflate.fromString(code)

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