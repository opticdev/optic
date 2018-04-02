package com.opticdev

import play.api.libs.json._

package object common {

  trait Versioned {
    def version: String
  }

  implicit val rangeJsonFormats = new OFormat[Range] {
    override def writes(o: Range): JsObject = {
      JsObject(Seq(
        "start" -> JsNumber(o.start),
        "end" -> JsNumber(o.end)
      ))
    }

    override def reads(json: JsValue): JsResult[Range] = {
      val asObject = json.as[JsObject]
      val start = (asObject \ "start").as[JsNumber].value.toInt
      val end = (asObject \ "end").as[JsNumber].value.toInt
      JsSuccess(Range(start, end))
    }
  }

}
