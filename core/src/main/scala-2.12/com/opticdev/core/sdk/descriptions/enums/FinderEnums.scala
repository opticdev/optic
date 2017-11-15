package com.opticdev.core.sdk.descriptions.enums

import play.api.libs.json.{JsError, _}

import scala.util.Try

object FinderEnums {

  sealed trait StringEnums

  case object Entire extends StringEnums
  case object Containing extends StringEnums
  case object Starting extends StringEnums



  implicit val stringReads: Reads[StringEnums] = new Reads[StringEnums] {
    override def reads(json: JsValue): JsResult[StringEnums] = {
      val typeOption = Try(json.as[JsString].value)
      if (typeOption.isFailure) throw new Error(json + " is not a valid String Finder Type") else typeOption.get match {
        case "entire" => JsSuccess(Entire)
        case "containing" => JsSuccess(Containing)
        case "starting" => JsSuccess(Starting)
        case _ => JsError(json+" is not a valid option. Must be one of [entire, containing, starting]")
      }
    }
  }

}
