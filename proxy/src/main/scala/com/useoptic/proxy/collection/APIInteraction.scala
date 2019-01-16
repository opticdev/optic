package com.useoptic.proxy.collection

import akka.http.scaladsl.model.{HttpEntity, RequestEntity}

case class APIInteraction(request: RawRequest, response: RawResponse)


abstract class HTTPTransaction {
  //shared fields
  def headers: Vector[(String, String)]
  def entity: Option[HttpEntity]

  //computed fields
  def contentType: Option[String] = {
    val fromEntity = entity.map(_.contentType.mediaType.value)
    if (fromEntity.isDefined) {
      return fromEntity
    }

    headers.find(_._1 == "Content-Type").map(_._2)
  }
}

case class RawRequest(fullPath: String, method: String, entity: Option[HttpEntity], headers: Vector[(String, String)]) extends HTTPTransaction
case class RawResponse(statusCode: Int, headers: Vector[(String, String)], entity: Option[HttpEntity]) extends HTTPTransaction