package com.opticdev.sdk.descriptions.transformation

import com.opticdev.sdk.descriptions.{Schema, SchemaRef}
import jdk.nashorn.api.scripting.{NashornScriptEngine, ScriptObjectMirror}
import play.api.libs.json.{JsObject, JsString}

import scala.util.Try

class TransformFunction(code: String, askSchema: JsObject = Transformation.emptyAskSchema, dynamicAskSchema: JsObject = Transformation.emptyAskSchema, inputSchemaRef: SchemaRef, implicit val outputSchemaRef: SchemaRef) {
  import com.opticdev.common.utils.JsObjectNashornImplicits._
  private implicit val engine: NashornScriptEngine = Transformation.engine
  lazy val inflated: Try[ScriptObjectMirror] = Inflate.fromString(code)

  def functionScriptObject = inflated

  lazy val dynamicAskSchemaInflated: Seq[DynamicAsk] = {
    dynamicAskSchema.fields.collect {
      case (key: String, value: JsObject) => Try {
        DynamicAsk(key, value.value("description").as[JsString].value, Inflate.fromString(value.value("func").as[JsString].value).get)
      }
    }.collect {
      case x if x.isSuccess => x.get
    }
  }

  def combinedAskSchema(value: JsObject) : JsObject = {
    val results = dynamicAskSchemaInflated.map(i=> Try {
      val mirror = i.code.call(null, value.asScriptObject.get).asInstanceOf[ScriptObjectMirror]
      i.key -> mirror.asJsObject.get
    })

    val dynamicAsk = results.collect {
      case x if x.isSuccess => x.get
    }

    val properties = (askSchema \ "properties").getOrElse(JsObject.empty).as[JsObject]

    askSchema + ("properties" -> (properties ++ JsObject(dynamicAsk)))
  }


  def transform(jsObject: JsObject, answers: JsObject, transformationCaller: TransformationCaller, inputModelId: Option[String]): Try[TransformationResult] = inflated.flatMap(transformFunction => Try {

    val askSchemaInflated = Schema.schemaObjectFromJson(combinedAskSchema(jsObject))

    if (!Schema.validate(askSchemaInflated, answers)) {
      throw new Exception("Ask Object does not match the Ask Schema for this transformation "+ askSchema.toString)
    }

    val scriptObject = jsObject.asScriptObject.get
    val answersObject = {answers ++ JsObject(Seq(
      "input" -> JsString(inputSchemaRef.full),
      "output" -> JsString(outputSchemaRef.full)
    ))}.asScriptObject.get

    val result = transformFunction.call(null, scriptObject, answersObject, inputModelId.orNull, transformationCaller)
    ProcessResult.objectResultFromScriptObject(result.asInstanceOf[ScriptObjectMirror])
  }).flatten

}