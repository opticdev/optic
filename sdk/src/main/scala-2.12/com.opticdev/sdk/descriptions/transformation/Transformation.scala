package com.opticdev.sdk.descriptions.transformation

import javax.script.ScriptEngineManager
import com.opticdev.common.PackageRef
import com.opticdev.sdk.descriptions._
import com.opticdev.sdk.descriptions.transformation.ProcessResult.objectResult
import jdk.nashorn.api.scripting.{NashornScriptEngine, ScriptObjectMirror}
import play.api.libs.json.{JsObject, _}

import scala.util.Try


object Transformation extends Description[Transformation] {

  val engine: NashornScriptEngine = new ScriptEngineManager(null).getEngineByName("nashorn").asInstanceOf[NashornScriptEngine]


  implicit val transformationReads = Json.using[Json.WithDefaultValues].reads[Transformation]

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

  def emptyAskSchema = JsObject(Seq("type" -> JsString("object")))

}

case class TransformationRef(packageRef: Option[PackageRef], id: String) {
  def full: String = if (packageRef.isEmpty) id else packageRef.get.full+"/"+id
  def internalFull = if (packageRef.isEmpty) id else packageRef.get.packageId+"/"+id
}

sealed trait TransformationBase extends PackageExportable {
  def script: String
  def input: SchemaRef
  def output: SchemaRef
  def ask: JsObject
  def dynamicAsk: JsObject
  lazy val transformFunction = new TransformFunction(script, ask, dynamicAsk, input, output)
}

//case class InlineTransformation() extends TransformationBase

case class Transformation(yields: String,
                          id: String,
                          packageId: PackageRef,
                          input: SchemaRef,
                          output: SchemaRef,
                          ask: JsObject,
                          dynamicAsk: JsObject = JsObject.empty,
                          script: String) extends TransformationBase {

  def hasAsk : Boolean = Try(
    (ask \ "properties").asInstanceOf[JsObject].fields.nonEmpty ||
    (dynamicAsk \ "properties").asInstanceOf[JsObject].fields.nonEmpty)
   .getOrElse(false)

  def combinedAsk(value: JsObject) : JsObject = transformFunction.combinedAskSchema(value)

  def transformationRef = TransformationRef(Some(packageId), id)

}