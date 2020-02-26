package com.useoptic.types.capture

import com.useoptic.diff.interactions.BodyUtilities

import scala.scalajs.js.annotation.JSExportAll

case class Capture(groupingIdentifiers: GroupingIdentifiers, batchItems: Vector[HttpInteraction])

case class GroupingIdentifiers(agentGroupId: String,
                               captureId: String,
                               agentId: String,
                               batchId: String)

@JSExportAll
case class HttpInteraction(uuid: String,
                           request: Request,
                           response: Response,
                           omitted: Vector[String])
@JSExportAll
case class Request(host: String,
                   method: String,
                   path: String,
                   queryString: String,
                   headers: Vector[Header],
                   body: Body)

@JSExportAll
case class Response(statusCode: Int, headers: Vector[Header], body: Body)

@JSExportAll
case class Header(name: String, value: String)

@JSExportAll
case class Body(asText: Option[String],
                asJsonString: Option[String])
