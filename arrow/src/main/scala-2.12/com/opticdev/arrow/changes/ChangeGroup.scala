package com.opticdev.arrow.changes

import play.api.libs.json.{JsArray, JsObject, JsValue, Json}
import JsonImplicits.changeGroupFormat
import com.opticdev.core.sourcegear.SourceGear

import scala.util.Try

case class ChangeGroup(changes: OpticChange*) {
  def asJson : JsValue = Json.toJson[ChangeGroup](this)
  def asJsonWithSchemas()(sourceGear: SourceGear) : JsValue = {

    JsObject(Seq(
      "changes" -> asJson,
      //include the schemas needed to render
      "schemas" -> {
        JsObject(
          changes.filter(_.schemaRefOption.isDefined).map(i=> {
            i.schemaRefOption.get.full -> sourceGear.findSchema(i.schemaRefOption.get).get.definition
          })
        )
      }
    ))

  }
}

object ChangeGroup {
  def fromJson(jsValue: JsValue) : Try[ChangeGroup] = Try {
    Json.fromJson[ChangeGroup](jsValue).get
  }

  def fromJson(string: String) : Try[ChangeGroup] =
    Try(fromJson(Json.parse(string)).get)
}