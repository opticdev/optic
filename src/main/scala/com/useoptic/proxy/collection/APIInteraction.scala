package com.useoptic.proxy.collection

case class APIInteraction(request: RawRequest, response: RawResponse)


abstract class HTTPTransaction {
  //shared fields
  def headers: Vector[(String, String)]
  def bodyBase64: Option[String]

  //computed fields
  def contentType: Option[String] = headers.reverse.find(_._1 == "Content-Type").map(_._2)
}

case class RawRequest(fullPath: String, method: String, bodyBase64: Option[String], headers: Vector[(String, String)]) extends HTTPTransaction
case class RawResponse(statusCode: Int, headers: Vector[(String, String)], bodyBase64: Option[String]) extends HTTPTransaction