package com.opticdev.sdk.descriptions.enums

import play.api.libs.json._

import scala.util.Try

object ComponentEnums {

  sealed trait TypesEnum

  case object Code extends TypesEnum
  case object Schema extends TypesEnum

  //reads
  implicit val typesReads: Reads[TypesEnum] = new Reads[TypesEnum] {
    override def reads(json: JsValue): JsResult[TypesEnum] = {
      val typeOption = Try(json.as[JsString].value)
      if (typeOption.isFailure) throw new Error(json + " is not a valid Component Type") else typeOption.get match {
        case "code" => JsSuccess(Code)
        case "schema" => JsSuccess(Schema)
        case _ => JsError(json+" is not a valid option. Must be one of [code, schema]")
      }
    }
  }

}