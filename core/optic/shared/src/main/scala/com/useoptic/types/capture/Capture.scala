package com.useoptic.types.capture

import com.useoptic.diff.interactions.BodyUtilities
import com.useoptic.serialization.Base64EncoderDecode
import io.circe.Json

import scala.scalajs.js.annotation.JSExportAll

case class Capture(groupingIdentifiers: GroupingIdentifiers, batchItems: Vector[HttpInteraction])

case class GroupingIdentifiers(agentGroupId: String,
                               captureId: String,
                               agentId: String,
                               batchId: String)

@JSExportAll
case class ArbitraryData(shapeHashV1Base64: Option[String] = None,
                         asJsonString: Option[String] = None,
                         asText: Option[String] = None) {
  def asShapeHashBytes: Option[Vector[Byte]] = shapeHashV1Base64.map(Base64EncoderDecode.decodeString)
}

case class HttpInteractionTag(name: String, value: String)

@JSExportAll
case class HttpInteraction(uuid: String,
                           request: Request,
                           response: Response,
                           tags: Vector[HttpInteractionTag]) {}

@JSExportAll
case class Request(host: String,
                   method: String,
                   path: String,
                   query: ArbitraryData,
                   headers: ArbitraryData,
                   body: Body)

@JSExportAll
case class Response(statusCode: Int, headers: ArbitraryData, body: Body)

@JSExportAll
case class Body(contentType: Option[String], value: ArbitraryData) {
  def isEmpty: Boolean = contentType.isEmpty && value.shapeHashV1Base64.isEmpty && value.asJsonString.isEmpty && value.asText.isEmpty
  def nonEmpty: Boolean = !isEmpty
  def jsonOption = BodyUtilities.parseBody(this).map(_.asJson)
}




// Companion Objects


object ArbitraryData {
  def empty = ArbitraryData(None, None, None)
}

object Response {
  def emptyWithStatusCode(statusCode: Int) = Response(statusCode, ArbitraryData.empty, Body.empty)
}

object Body {
  def empty = Body(None, ArbitraryData.empty)
}


