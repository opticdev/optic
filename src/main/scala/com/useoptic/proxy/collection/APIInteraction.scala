package com.useoptic.proxy.collection

case class APIInteraction(request: RawRequest, response: RawResponse)


abstract class HTTPTransaction {
  //shared fields
  def headers: Map[String, String]
  def bodyBase64: Option[String]

  //computed fields
  def contentType: Option[String] = headers.get("Content-type")
}

case class RawRequest(path: String, method: String, bodyBase64: Option[String], headers: Map[String, String]) extends HTTPTransaction
case class RawResponse(statusCode: String, headers: Map[String, String], bodyBase64: Option[String]) extends HTTPTransaction