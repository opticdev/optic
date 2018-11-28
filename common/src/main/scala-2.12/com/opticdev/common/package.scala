package com.opticdev
import better.files.File
import play.api.libs.json._
import scala.util.Try

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

  //File
  implicit val fileFormat = new Format[File] {
    override def reads(json: JsValue) = {
      JsSuccess(Try(File(json.as[JsString].value)).get)
    }

    override def writes(o: File) = {
      JsString(o.pathAsString)
    }
  }


  trait SGExportable

}
