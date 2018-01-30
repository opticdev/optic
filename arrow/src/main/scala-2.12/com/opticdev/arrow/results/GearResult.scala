package com.opticdev.arrow.results

import com.opticdev.core.sourcegear.Gear
import play.api.libs.json.{JsObject, JsString}

case class GearResult(gear: Gear, score: Int) extends Result {
  override def asJson = {
    JsObject(Seq(
      "name" -> JsString(gear.name),
      "packageId" -> JsString("")
    ))
  }
}
