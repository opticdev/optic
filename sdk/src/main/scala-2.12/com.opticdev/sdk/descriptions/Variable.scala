package com.opticdev.sdk.descriptions

import com.opticdev.sdk.descriptions.enums.VariableEnums.InEnum
import com.opticdev.sdk.descriptions.finders.Finder
import play.api.libs.json.{JsValue, Json}

object Variable extends Description[Variable] {

  import com.opticdev.sdk.descriptions.enums.VariableEnums.inReads
  implicit val variableReads = Json.reads[Variable]

  override def fromJson(jsValue: JsValue) : Variable = {
    Json.fromJson[Variable](jsValue).get
  }

}

case class Variable(token: String, in: InEnum)