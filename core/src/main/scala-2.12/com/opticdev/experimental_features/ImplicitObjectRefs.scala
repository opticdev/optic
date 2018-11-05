package com.opticdev.experimental_features

import com.opticdev.common.{ObjectRef, SchemaRef}
import play.api.libs.json.{JsObject, JsString}

import scala.util.Try

object ImplicitObjectRefs {

  val presets: Map[String, JsObject => Try[String]] = {

    val endpointName = (value: JsObject) => Try {
      val method = (value \ "method").get.as[JsString].value
      val url = (value \ "url").get.as[JsString].value

      s"""${method.toUpperCase} ${url}"""
    }

    Map(
      "optic:rest/route" -> endpointName,
      "apiatlas:schemas/endpoint" -> endpointName
    )

  }

  def objectRefForModelNode(schemaRef: SchemaRef, value: JsObject) = {
    val result = presets.get(schemaRef.internalFull).map(_(value))
    if (result.isDefined && result.get.isSuccess) {
      Some(ObjectRef(result.get.get))
    } else {
      None
    }
  }

}
