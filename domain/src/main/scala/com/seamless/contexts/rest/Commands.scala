package com.seamless.contexts.rest

import com.seamless.contexts.rest.Events.RestEvent
import com.seamless.contexts.rest.HttpMethods.HttpMethod
import com.seamless.ddd.{AggregateId, ExportedCommand}

import scala.scalajs.js.annotation.{JSExportAll, JSExportDescendentClasses}

object Commands {

  type EndpointId = String
  type ResponseId = String
  type BodyId = String

  case class CreateEndpoint(endpointId: EndpointId, method: HttpMethod, path: String = "/") extends RestCommand
  case class SetMethod(method: HttpMethod, endpointId: EndpointId) extends RestCommand
  case class SetPath(path: String, endpointId: EndpointId) extends RestCommand

  case class AddRequestBody(requestBodyId: BodyId, rootShapeId: Option[String], contentType: ContentType, endpointId: EndpointId) extends RestCommand
  case class RemoveRequestBody(requestBodyId: BodyId, endpointId: EndpointId) extends RestCommand

  case class AddResponse(responseId: ResponseId, status: Int, endpointId: EndpointId) extends RestCommand
  case class SetResponseStatus(responseId: ResponseId, status: Int, endpointId: EndpointId) extends RestCommand

  case class AddResponseBody(id: String, rootShapeId: Option[String], contentType: ContentType, responseId: ResponseId, endpointId: EndpointId) extends RestCommand
  case class RemoveResponseBody(id: String, responseId: ResponseId, endpointId: EndpointId) extends RestCommand

  @JSExportDescendentClasses
  @JSExportAll
  trait RestCommand extends ExportedCommand

}