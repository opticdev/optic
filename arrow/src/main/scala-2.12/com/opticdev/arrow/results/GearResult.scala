package com.opticdev.arrow.results

import com.opticdev.arrow.changes.{ChangeGroup, InsertModel}
import com.opticdev.arrow.context.ArrowContextBase
import com.opticdev.core.sourcegear.{Gear, SourceGear}
import com.opticdev.sdk.descriptions.{Schema, SchemaRef}
import play.api.libs.json.{JsObject, JsString}

case class GearResult(gear: Gear, score: Int, context: ArrowContextBase)(implicit sourcegear: SourceGear) extends Result {
  override def asJson = {
    JsObject(Seq(
      "name" -> JsString(gear.name),
      "packageId" -> JsString(""),
      "schema" -> sourcegear.findSchema(gear.parser.schema).get.definition,
      "changes" -> changes.asJson
    ))
  }

  override def changes = ChangeGroup(
    InsertModel(gear.parser.schema, JsObject.empty, context.toInsertLocation.orNull)
  )
}
