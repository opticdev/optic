package com.opticdev.arrow.results

import com.opticdev.arrow.changes.{ChangeGroup, InsertModel}
import com.opticdev.arrow.context.ArrowContextBase
import com.opticdev.core.sourcegear.project.OpticProject
import com.opticdev.core.sourcegear.{Gear, SourceGear}
import com.opticdev.sdk.descriptions.{Schema, SchemaRef}
import play.api.libs.json.{JsObject, JsString}

case class GearResult(gear: Gear, score: Int, context: ArrowContextBase)(implicit sourcegear: SourceGear, project: OpticProject) extends Result {
  override def asJson = {
    JsObject(Seq(
      "name" -> JsString(gear.name),
      "projectName" -> JsString(project.name),
      "packageId" -> JsString(gear.packageFull),
      "schemaRef" -> JsString(gear.schemaRef.full),
      "changes" -> changes.asJson
    ))
  }

  override def changes = ChangeGroup(
    InsertModel(sourcegear.findSchema(gear.schemaRef).get, Some(gear.id), JsObject.empty, context.toInsertLocation.orNull)
  )
}
