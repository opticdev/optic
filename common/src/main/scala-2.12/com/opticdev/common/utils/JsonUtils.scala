package com.opticdev.common.utils

import play.api.libs.json.{JsArray, JsObject, JsValue}

object JsonUtils {

  def removeReservedFields(value: JsValue) : JsValue = value match {
    case a: JsArray => JsArray(a.value.map(i=> removeReservedFields(i)))
    case a: JsObject => JsObject(a.fields.filterNot(_._1.startsWith("_")).map(i=> (i._1, removeReservedFields(i._2))))
    case _ => value
  }

  def filterPaths(source: JsObject, predicate: (JsValue)=> Boolean, deep: Boolean = false, startingPath: Seq[String] = Seq()) : Set[Seq[String]] = {
    val matchedPaths = source.fieldSet.collect {
      case field: (String, JsValue) if predicate(field._2) => startingPath :+ field._1
    }

    val nestedResults = if (deep) source.fieldSet.collect {
      case (key: String, obj:JsObject) => filterPaths(obj, predicate, deep, startingPath :+ key)
    }.flatten else Seq()

    matchedPaths.toSet ++ nestedResults
  }

}
