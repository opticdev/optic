package com.opticdev.sdk.descriptions.transformation

import javax.script.ScriptEngineManager
import com.opticdev.common.PackageRef
import com.opticdev.sdk.descriptions._
import jdk.nashorn.api.scripting.{NashornScriptEngine, ScriptObjectMirror}
import play.api.libs.json.{JsObject, _}

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

  def emptyAskSchema = JsObject(Seq("type" -> JsString("object")))

}

class TransformFunction(code: String, askSchema: JsObject = Transformation.emptyAskSchema, inputSchemaRef: SchemaRef, implicit val outputSchemaRef: SchemaRef) {
  import com.opticdev.common.utils.JsObjectNashornImplicits._
  private implicit val engine: NashornScriptEngine = Transformation.engine
  lazy val inflated: Try[ScriptObjectMirror] = Inflate.fromString(code)

  private lazy val askSchemaInflated = Schema.schemaObjectFromJson(askSchema)

  def transform(jsObject: JsObject, answers: JsObject): Try[TransformationResult] = inflated.flatMap(transformFunction => Try {
    if (!Schema.validate(askSchemaInflated, answers)) {
      throw new Exception("Ask Object does not match the Ask Schema for this transformation "+ askSchema.toString)
    }

    val scriptObject = jsObject.asScriptObject.get
    val answersObject = {answers ++ JsObject(Seq(
        "input" -> JsString(inputSchemaRef.full),
        "output" -> JsString(outputSchemaRef.full)
      ))}.asScriptObject.get

    val result = transformFunction.call(null, scriptObject, answersObject).asInstanceOf[ScriptObjectMirror]

    ProcessResult.objectResultFromScriptObject(result)
  }).flatten

}

sealed trait TransformationBase extends PackageExportable {
  def script: String
  def input: SchemaRef
  def output: SchemaRef
  def ask: JsObject
  val transformFunction = new TransformFunction(script, ask, input, output)
}

//case class InlineTransformation() extends TransformationBase

case class Transformation(yields: String,
                          packageId: PackageRef,
                          input: SchemaRef,
                          output: SchemaRef,
                          ask: JsObject,
                          script: String) extends TransformationBase {

  def hasAsk : Boolean = Try((ask \ "properties").asInstanceOf[JsObject].fields.nonEmpty).getOrElse(false)

}