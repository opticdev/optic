package com.seamless.contexts.requests

import com.seamless.contexts.requests.Commands.{PathComponentId, RequestId, RequestParameterId, ResponseId, ShapedBodyDescriptor, ShapedRequestParameterShapeDescriptor}
import com.seamless.contexts.rfc.Events.RfcEvent

object Events {

  case class PathComponentAdded(pathId: PathComponentId, parentPathId: PathComponentId, name: String) extends RequestsEvent
  case class PathComponentRenamed(pathId: PathComponentId, name: String) extends RequestsEvent
  case class PathComponentRemoved(pathId: PathComponentId) extends RequestsEvent

  case class PathParameterAdded(pathId: PathComponentId, parentPathId: PathComponentId, name: String) extends RequestsEvent
  case class PathParameterShapeSet(pathId: PathComponentId, shapeDescriptor: ShapedRequestParameterShapeDescriptor) extends RequestsEvent
  case class PathParameterRenamed(pathId: PathComponentId, name: String) extends RequestsEvent
  case class PathParameterRemoved(pathId: PathComponentId) extends RequestsEvent

  case class RequestParameterAdded(parameterId: RequestParameterId, requestId: PathComponentId, parameterLocation: String, name: String) extends RequestsEvent
  case class RequestParameterRenamed(parameterId: RequestParameterId, name: String) extends RequestsEvent
  case class RequestParameterShapeSet(parameterId: RequestParameterId, parameterDescriptor: ShapedRequestParameterShapeDescriptor) extends RequestsEvent
  case class RequestParameterShapeUnset(parameterId: RequestParameterId) extends RequestsEvent
  case class RequestParameterRemoved(parameterId: RequestParameterId) extends RequestsEvent

  case class RequestAdded(requestId: RequestId, pathId: PathComponentId, httpMethod: String) extends RequestsEvent
  case class RequestBodySet(requestId: RequestId, bodyDescriptor: ShapedBodyDescriptor) extends RequestsEvent
  case class RequestBodyUnset(requestId: RequestId) extends RequestsEvent
  case class RequestRemoved(requestId: RequestId) extends RequestsEvent

  case class ResponseAdded(responseId: ResponseId, requestId: RequestId, httpStatusCode: Int) extends RequestsEvent
  case class ResponseStatusCodeSet(responseId: ResponseId, httpStatusCode: Int) extends RequestsEvent
  case class ResponseBodySet(responseId: ResponseId, bodyDescriptor: ShapedBodyDescriptor) extends RequestsEvent
  case class ResponseBodyUnset(responseId: ResponseId) extends RequestsEvent
  case class ResponseRemoved(responseId: ResponseId) extends RequestsEvent

  sealed trait RequestsEvent extends RfcEvent

}