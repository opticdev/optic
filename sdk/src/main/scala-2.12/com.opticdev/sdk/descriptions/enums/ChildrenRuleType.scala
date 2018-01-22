package com.opticdev.sdk.descriptions.enums

import play.api.libs.json.{JsError, _}

import scala.util.Try

object RuleEnums {

  sealed trait ChildrenRuleTypeEnum

  case object Any extends ChildrenRuleTypeEnum
  case object Exact extends ChildrenRuleTypeEnum
  case object SameAnyOrder extends ChildrenRuleTypeEnum
  case object SamePlus extends ChildrenRuleTypeEnum
  case object SameAnyOrderPlus extends ChildrenRuleTypeEnum

  //@todo add min/max, allowed types and other rules


  //reads
  implicit val childrenRuleReads: Reads[ChildrenRuleTypeEnum] = new Reads[ChildrenRuleTypeEnum] {
    override def reads(json: JsValue): JsResult[ChildrenRuleTypeEnum] = {
      val typeOption = Try(json.as[JsString].value)
      if (typeOption.isFailure) throw new Error(json + " is not a valid Child Rule Type") else typeOption.get match {
        case "any" => JsSuccess(Any)
        case "exact" => JsSuccess(Exact)
        case "same-plus" => JsSuccess(SamePlus)
        case "same-any-order" => JsSuccess(SameAnyOrder)
        case "same-plus-any-order" => JsSuccess(SameAnyOrderPlus)
        case _ => JsError(json+" is not a valid option. Must be one of [any, exact, same-plus, same-any-order, same-plus-any-order]")
      }
    }
  }
}
