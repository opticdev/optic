package com.opticdev.sdk.descriptions.enums
import play.api.libs.json.{JsError, JsResult, JsString, JsSuccess, JsValue, Reads, _}

import scala.util.Try

object VariableEnums {
  sealed trait InEnum
  case object Self extends InEnum
  case object Scope extends InEnum

  implicit val inReads: Reads[InEnum] = new Reads[InEnum] {
    override def reads(json: JsValue): JsResult[InEnum] = {
      val typeOption = Try(json.as[JsString].value)
      if (typeOption.isFailure) throw new Error(json + " is not a valid variable rule type") else typeOption.get match {
        case "self" => JsSuccess(Self)
        case "scope" => JsSuccess(Scope)
        case _ => JsError(json+" is not a valid option. Must be one of [self, scope]")
      }
    }
  }

}