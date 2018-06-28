package com.opticdev.sdk.descriptions.transformation

import jdk.nashorn.api.scripting.{NashornScriptEngine, ScriptObjectMirror}
import play.api.libs.json.{JsBoolean, JsObject, JsResult, Json}
import collection.JavaConverters._
import scala.util.{Success, Try}
import com.opticdev.common.utils.JsObjectNashornImplicits._
import com.opticdev.common.SchemaRef
import com.opticdev.sdk.descriptions.transformation.generate.{SingleModel, StagedNode}
import com.opticdev.sdk.descriptions.transformation.mutate.StagedMutation

object ProcessResult {
  def objectResult(jsObject: JsObject)(implicit outputSchemaRef: SchemaRef): Try[TransformationResult] = Try {
    val stagedNodeOption = Try ( {
      require((jsObject \ "_isStagedNode").get.as[JsBoolean].value)
      Json.fromJson[StagedNode](jsObject).asOpt
    } ).map(_.get)
    val stagedMutationOption = Try ( {
      require((jsObject \ "_isStagedMutation").get.as[JsBoolean].value)
      Json.fromJson[StagedMutation](jsObject).asOpt
    } ).map(_.get)

    jsObject match {
      case result if stagedNodeOption.isSuccess => stagedNodeOption.get
      case result if stagedMutationOption.isSuccess => stagedMutationOption.get
      case _ => SingleModel(outputSchemaRef, jsObject)
    }

  }

  def objectResultFromScriptObject(obj: AnyRef)(implicit engine: NashornScriptEngine, outputSchemaRef: SchemaRef) : Try[TransformationResult] = Try {

    obj match {
      case mirror: ScriptObjectMirror if mirror.isArray=> {
        val items = mirror.values().asScala.map(i=> objectResultFromScriptObject(i)).collect {
          case a if a.isSuccess && !a.get.isInstanceOf[MultiTransform] => a.get
        }
        MultiTransform(items.toSeq)
      }
      case mirror: ScriptObjectMirror =>
        mirror.asJsObject.flatMap(objectResult).get
      case a: AnyRef => {
        throw new Exception(s"Transformation function must return an object. Type ${a.getClass} found")
      }
    }

  }

}
