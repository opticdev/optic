package com.opticdev.common.utils

import play.api.libs.json.{JsArray, JsObject, JsValue}

object JsonUtils {

  def removeReservedFields(value: JsValue) : JsValue = value match {
    case a: JsArray => JsArray(a.value.map(i=> removeReservedFields(i)))
    case a: JsObject => JsObject(a.fields.filterNot(_._1.startsWith("_")).map(i=> (i._1, removeReservedFields(i._2))))
    case _ => value
  }

}
