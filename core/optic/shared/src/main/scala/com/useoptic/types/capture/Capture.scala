package com.useoptic.types.capture

case class Capture(groupingIdentifiers: GroupingIdentifiers, batchItems: Vector[HttpInteraction])

case class GroupingIdentifiers(agentGroupId: String,
                               captureId: String,
                               agentId: String,
                               batchId: String)

case class HttpInteraction(uuid: String,
                           request: Request,
                           response: Response,
                           omitted: Vector[String])

case class Request(host: String,
                   method: String,
                   path: String,
                   queryString: String,
                   headers: Vector[Header],
                   body: Body)

case class Response(statusCode: Int, headers: Vector[Header], body: Body)

case class Header(name: String, value: String)

case class Body(asText: Option[String],
                asJsonString: Option[String])
