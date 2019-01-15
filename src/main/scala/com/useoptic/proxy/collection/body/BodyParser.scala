package com.useoptic.proxy.collection.body

import com.useoptic.common.spec_types.RequestBody
import play.api.libs.json.{JsObject, JsString, Json}
import scalaj.http.Base64

import scala.util.Try

object BodyParser {

  def parse(contentType: String, base64Body: String): Try[RequestBody] = Try {
    val decoded = Base64.decodeString(base64Body)

    val asSchema: Try[JsObject] = contentType match {
      case "application/json" => {
        Try(SchemaInference.infer(Json.parse(decoded))).recoverWith {
          case _ => throw InvalidBodyContents("json")
        }
      }
      case "text/plain" => Try(SchemaInference.infer(JsString("")))
      case _ => Try(throw UnsupportedContentType(contentType))
    }

    if (asSchema.isFailure) {
      throw asSchema.failed.get
    }

    RequestBody(contentType, asSchema.toOption)
  }

}


//Exceptions
case class UnsupportedContentType(contentType: String) extends Exception {
  override def getMessage: String = s"Unsupported Content Type "+contentType
}

case class InvalidBodyContents(expected: String) extends Exception {
  override def getMessage: String = s"The body for this request is not valid "+expected
}