package com.opticdev.core.sdk.descriptions.enums

import play.api.libs.json._

import scala.util.Try

object ComponentEnums {

  sealed trait TypesEnum

  case object Code extends TypesEnum
  case object Schema extends TypesEnum


  sealed trait CodeEnum

  case object Token extends CodeEnum
  case object Literal extends CodeEnum


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

  implicit val codeReads: Reads[CodeEnum] = new Reads[CodeEnum] {
    override def reads(json: JsValue): JsResult[CodeEnum] = {
      val typeOption = Try(json.as[JsString].value)
      if (typeOption.isFailure) throw new Error(json + " is not a valid Component Code Type") else typeOption.get match {
        case "token" => JsSuccess(Token)
        case "literal" => JsSuccess(Literal)
        case _ => JsError(json+" is not a valid option. Must be one of [token, literal]")
      }
    }
  }
}