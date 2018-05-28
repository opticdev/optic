package com.opticdev.arrow.results

import com.opticdev.arrow.changes.{ChangeGroup, ClearSearchLines, InsertModel}
import com.opticdev.arrow.context.ArrowContextBase
import com.opticdev.core.sourcegear.project.OpticProject
import com.opticdev.core.sourcegear.{CompiledLens, SourceGear}
import com.opticdev.sdk.descriptions.{Schema, SchemaRef}
import play.api.libs.json.{JsNull, JsObject, JsString}

case class GearResult(gear: CompiledLens, score: Int, context: ArrowContextBase)(implicit sourcegear: SourceGear, project: OpticProject, editorSlug: String) extends Result {
  override def asJson = {
    JsObject(Seq(
      "name" -> gear.name.map(JsString).getOrElse(JsNull),
      "projectName" -> JsString(project.name),
      "editorSlug" -> JsString(editorSlug),
      "packageId" -> JsString(gear.lensRef.packageRef.get.full),
      "schemaRef" -> JsString(gear.schemaRef.full),
      "changes" -> changes.asJson
    ))
  }

  override def changes = {
    import com.opticdev.core.sourcegear.context.SDKObjectsResolvedImplicits._

    val insertModel = InsertModel(sourcegear.findSchema(gear.resolvedSchema).get, Some(gear.lensRef.full), JsObject.empty, context.toInsertLocation)

    val changes = if (context.toInsertLocation.isDefined) {
      Seq(insertModel, ClearSearchLines(context.toInsertLocation.get.file))
    } else {
      Seq(insertModel)
    }

    ChangeGroup(changes:_*)
  }
}
