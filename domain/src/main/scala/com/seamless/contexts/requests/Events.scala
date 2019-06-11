package com.seamless.contexts.requests

import com.seamless.contexts.data_types.Commands.ShapeId
import com.seamless.contexts.requests.Commands.{BodyDescriptor, ParameterId, PathComponentId, RequestId, ResponseId, ShapedBodyDescriptor}

object Events {

  case class PathComponentAdded(pathId: PathComponentId, parentPathId: PathComponentId, name: String) extends RequestsEvent

  case class PathComponentRenamed(pathId: PathComponentId, name: String) extends RequestsEvent

  case class PathComponentRemoved(pathId: PathComponentId) extends RequestsEvent


  case class PathParameterAdded(pathId: PathComponentId, name: String) extends RequestsEvent

  case class PathParameterShapeSet(pathId: PathComponentId, shapeId: ShapeId) extends RequestsEvent

  case class PathParameterRemoved(pathId: PathComponentId) extends RequestsEvent


  case class QueryParameterAdded(parameterId: ParameterId, requestId: PathComponentId, name: String) extends RequestsEvent

  case class QueryParameterShapeSet(parameterId: ParameterId, shapeId: ShapeId) extends RequestsEvent

  case class QueryParameterRemoved(parameterId: ParameterId) extends RequestsEvent


  case class HeaderParameterAdded(parameterId: ParameterId, requestId: PathComponentId, name: String) extends RequestsEvent

  case class HeaderParameterShapeSet(parameterId: ParameterId, shapeId: ShapeId) extends RequestsEvent

  case class HeaderParameterRemoved(parameterId: ParameterId) extends RequestsEvent


  case class RequestAdded(requestId: RequestId, pathId: PathComponentId, httpMethod: String) extends RequestsEvent

  case class RequestBodySet(requestId: RequestId, bodyDescriptor: ShapedBodyDescriptor) extends RequestsEvent

  case class RequestRemoved(requestId: RequestId) extends RequestsEvent


  case class ResponseAdded(responseId: ResponseId, requestId: RequestId, httpStatusCode: Int) extends RequestsEvent

  case class ResponseStatusCodeSet(responseId: ResponseId, httpStatusCode: Int) extends RequestsEvent

  case class ResponseBodySet(responseId: ResponseId, bodyDescriptor: ShapedBodyDescriptor) extends RequestsEvent

  case class ResponseRemoved(responseId: ResponseId) extends RequestsEvent


  trait RequestsEvent

}