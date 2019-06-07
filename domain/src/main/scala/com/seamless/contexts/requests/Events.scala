package com.seamless.contexts.requests

import com.seamless.contexts.data_types.Commands.ShapeId
import com.seamless.contexts.requests.Commands.{EndpointId, PathComponentId, RequestId, ResponseId}

/*
  These are DomainEvents. They should include EventMessage metadata
 */
object Events {

  case class PathComponentAdded(pathId: PathComponentId, parentPathId: PathComponentId, name: String) extends RequestsEvent

  case class PathComponentRenamed(pathId: PathComponentId, name: String) extends RequestsEvent

  case class PathComponentRemoved(pathId: PathComponentId) extends RequestsEvent


  case class PathParameterAdded(pathId: PathComponentId, name: String) extends RequestsEvent

  case class PathParameterShapeSet(pathId: PathComponentId, shapeId: ShapeId) extends RequestsEvent

  case class PathParameterRemoved(pathId: PathComponentId) extends RequestsEvent


  case class QueryParameterAdded(pathId: PathComponentId, name: String) extends RequestsEvent

  case class QueryParameterShapeSet(pathId: PathComponentId, shapeId: ShapeId) extends RequestsEvent

  case class QueryParameterRemoved(pathId: PathComponentId) extends RequestsEvent


  case class HeaderParameterAdded(pathId: PathComponentId, name: String) extends RequestsEvent

  case class HeaderParameterShapeSet(pathId: PathComponentId, shapeId: ShapeId) extends RequestsEvent

  case class HeaderParameterRemoved(pathId: PathComponentId) extends RequestsEvent


  case class RequestAdded(requestId: RequestId, pathId: PathComponentId, httpMethod: String, httpContentType: String) extends RequestsEvent

  case class RequestBodySet(requestId: RequestId, bodyShapeId: ShapeId) extends RequestsEvent

  case class RequestRemoved(requestId: RequestId) extends RequestsEvent


  case class ResponseAdded(responseId: ResponseId, requestId: RequestId, httpStatusCode: Int, httpContentType: String) extends RequestsEvent

  case class ResponseStatusCodeSet(responseId: ResponseId, httpStatusCode: Int) extends RequestsEvent

  case class ResponseBodySet(responseId: ResponseId, bodyShapeId: ShapeId) extends RequestsEvent

  case class ResponseBodyRemoved(responseId: ResponseId) extends RequestsEvent


  trait RequestsEvent

}