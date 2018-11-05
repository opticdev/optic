package com.opticdev.sdk.skills_sdk.utils

import play.api.libs.json._

import scala.util.Try

object EnumFormatsFromTypes {
  def newFormats[A](cases: Map[String, A]) : Format[A] = {
    new Format[A] {
      override def reads(json: JsValue): JsResult[A] = {
        Try(cases(json.as[JsString].value)).map(i=> JsSuccess(i))
          .getOrElse(throw new NoSuchElementException(s"Invalid enum '${json.as[JsString].value}'. Valid options: ${cases.keys.mkString(", ")}"))
      }
      override def writes(o: A): JsValue = JsString(cases.find(_._2 == o).map(_._1).get)
    }
  }
}
