package com.opticdev.arrow.results

import com.opticdev.sdk.descriptions.Schema
import play.api.libs.json.{JsObject, JsString}

case class SchemaResult(schema: Schema, score: Int) extends Result {
  override def asJson = JsObject(Seq(
    "name" -> JsString(schema.name),
    "schemaId" -> JsString(schema.schemaRef.full)
  ))
}
