package com.seamless.contexts.rest

import com.seamless.contexts.rest.Commands.{EndpointId, BodyId, ResponseId, RestCommand}
import com.seamless.contexts.rest.HttpMethods.HttpMethod
import com.seamless.ddd.AggregateId


object Events {

  case class CreatedEndpoint(endpointId: EndpointId, method: HttpMethod, path: String) extends RestEvent
  case class MethodUpdated(method: HttpMethod, endpointId: EndpointId) extends RestEvent
  case class PathUpdated(path: String, endpointId: EndpointId) extends RestEvent

  case class AddedResponse(responseId: ResponseId, status: Int, endpointId: EndpointId) extends RestEvent
  case class ResponseStatusChanged(responseId: ResponseId, status: Int, endpointId: EndpointId) extends RestEvent

  case class AddedRequestBody(requestBodyId: BodyId, rootShapeId: Option[String], contentType: ContentType, endpointId: EndpointId) extends RestEvent
  case class RemovedRequestBody(requestBodyId: BodyId, endpointId: EndpointId) extends RestEvent

  case class AddedContentType(id: String, rootShapeId: Option[String], contentType: ContentType, responseId: ResponseId, endpointId: EndpointId) extends RestEvent
  case class RemovedContentType(id: String, responseId: ResponseId, endpointId: EndpointId) extends RestEvent

  trait RestEvent
}
