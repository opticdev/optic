package com.useoptic.types.capture

import scala.scalajs.js.annotation.JSExportAll

case class Capture(groupingIdentifiers: GroupingIdentifiers, batchItems: Vector[HttpInteraction])

case class GroupingIdentifiers(agentGroupId: String,
                               captureId: String,
                               agentId: String,
                               batchId: String)

case class ShapeHashBytes(bytes: Vector[Byte])

@JSExportAll
case class ArbitraryData(asShapeHashBytes: Option[ShapeHashBytes] = None,
                         asJsonString: Option[String] = None,
                         asText: Option[String] = None)

case class HttpInteractionTag(name: String, value: String)

@JSExportAll
case class HttpInteraction(uuid: String,
                           request: Request,
                           response: Response,
                           tags: Vector[HttpInteractionTag])

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
  def isEmpty: Boolean = contentType.isEmpty && value.asShapeHashBytes.isEmpty && value.asJsonString.isEmpty && value.asText.isEmpty
  def nonEmpty: Boolean = !isEmpty
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


