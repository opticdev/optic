package com.opticdev.server.data

import play.api.libs.json.{JsNumber, JsObject}

object ToJsonImplicits {

  implicit class RangeToJson(range: Range) {
    def toJson = JsObject(Seq(
      "start" -> JsNumber(range.start),
      "end" -> JsNumber(range.end))
    )
  }

}
