package com.opticdev.arrow.results

import com.opticdev.arrow.changes.{ChangeGroup, InsertModel}
import com.opticdev.arrow.context.ArrowContextBase
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.sdk.descriptions.{Schema, SchemaRef}
import play.api.libs.json.{JsObject, JsString}

case class SchemaResult(schema: Schema, score: Int, context : ArrowContextBase)(implicit sourcegear: SourceGear) extends Result {
  override def asJson = JsObject(Seq(
    "name" -> JsString(schema.name),
    "schemaId" -> JsString(schema.schemaRef.full),
    "changes" -> changes.asJson
  ))

  override def changes = ChangeGroup(
    InsertModel(schema, None, JsObject.empty, context.toInsertLocation)
  )
}
