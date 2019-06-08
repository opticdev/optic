package com.seamless.oas

import com.seamless.oas.versions.{OAS2Resolver, OAS3Resolver}
import play.api.libs.json.{JsObject, JsString}

import scala.util.Try

object OASResolverHelper {
  def fromJSON(json: JsObject): OASResolver = {
    if (isSwagger2(json)) {
      new OAS2Resolver(json)
    } else if (isOAS3(json)) {
      new OAS3Resolver(json)
    } else {
      null
    }
  }

  def isSwagger2(json: JsObject) = Try(json.value("swagger").as[JsString].value.startsWith("2"))
    .getOrElse(false)
  def isOAS3(json: JsObject) = Try(json.value("openapi").as[JsString].value.startsWith("3"))
    .getOrElse(false)

}
