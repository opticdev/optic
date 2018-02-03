package com.opticdev.arrow.results

import com.opticdev.core.sourcegear.{Gear, SourceGear}
import com.opticdev.sdk.descriptions.Schema
import play.api.libs.json.{JsObject, JsString}

case class GearResult(gear: Gear, score: Int) extends Result {
  override def asJson()(implicit sourcegear: SourceGear) = {
    JsObject(Seq(
      "name" -> JsString(gear.name),
      "packageId" -> JsString(""),
      "schema" -> sourcegear.findSchema(gear.parser.schema).get.definition
    ))
  }
}
