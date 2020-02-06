package com.useoptic.contexts.requests

import com.useoptic.contexts.requests.Commands._
import com.useoptic.contexts.rfc.Events._

object Events {

  case class PathComponentAdded(pathId: PathComponentId, parentPathId: PathComponentId, name: String, eventContext: Option[EventContext] = None) extends RequestsEvent
  case class PathComponentRenamed(pathId: PathComponentId, name: String, eventContext: Option[EventContext] = None) extends RequestsEvent
  case class PathComponentRemoved(pathId: PathComponentId, eventContext: Option[EventContext] = None) extends RequestsEvent

  case class PathParameterAdded(pathId: PathComponentId, parentPathId: PathComponentId, name: String, eventContext: Option[EventContext] = None) extends RequestsEvent
  case class PathParameterShapeSet(pathId: PathComponentId, shapeDescriptor: ShapedRequestParameterShapeDescriptor, eventContext: Option[EventContext] = None) extends RequestsEvent
  case class PathParameterRenamed(pathId: PathComponentId, name: String, eventContext: Option[EventContext] = None) extends RequestsEvent
  case class PathParameterRemoved(pathId: PathComponentId, eventContext: Option[EventContext] = None) extends RequestsEvent

  case class RequestParameterAdded(parameterId: RequestParameterId, requestId: PathComponentId, parameterLocation: String, name: String, eventContext: Option[EventContext] = None) extends RequestsEvent
  case class RequestParameterRenamed(parameterId: RequestParameterId, name: String, eventContext: Option[EventContext] = None) extends RequestsEvent
  case class RequestParameterShapeSet(parameterId: RequestParameterId, parameterDescriptor: ShapedRequestParameterShapeDescriptor, eventContext: Option[EventContext] = None) extends RequestsEvent
  case class RequestParameterShapeUnset(parameterId: RequestParameterId, eventContext: Option[EventContext] = None) extends RequestsEvent
  case class RequestParameterRemoved(parameterId: RequestParameterId, eventContext: Option[EventContext] = None) extends RequestsEvent

  case class RequestAdded(requestId: RequestId, pathId: PathComponentId, httpMethod: String, eventContext: Option[EventContext] = None) extends RequestsEvent
  case class RequestContentTypeSet(requestId: RequestId, httpContentType: String, eventContext: Option[EventContext] = None) extends RequestsEvent
  case class RequestBodySet(requestId: RequestId, bodyDescriptor: ShapedBodyDescriptor, eventContext: Option[EventContext] = None) extends RequestsEvent
  case class RequestBodyUnset(requestId: RequestId, eventContext: Option[EventContext] = None) extends RequestsEvent
  case class RequestRemoved(requestId: RequestId, eventContext: Option[EventContext] = None) extends RequestsEvent

  case class ResponseAdded(responseId: ResponseId, requestId: RequestId, httpStatusCode: Int, eventContext: Option[EventContext] = None) extends RequestsEvent
  case class ResponseStatusCodeSet(responseId: ResponseId, httpStatusCode: Int, eventContext: Option[EventContext] = None) extends RequestsEvent
  case class ResponseContentTypeSet(responseId: ResponseId, httpContentType: String, eventContext: Option[EventContext] = None) extends RequestsEvent
  case class ResponseBodySet(responseId: ResponseId, bodyDescriptor: ShapedBodyDescriptor, eventContext: Option[EventContext] = None) extends RequestsEvent
  case class ResponseBodyUnset(responseId: ResponseId, eventContext: Option[EventContext] = None) extends RequestsEvent
  case class ResponseRemoved(responseId: ResponseId, eventContext: Option[EventContext] = None) extends RequestsEvent

  sealed trait RequestsEvent extends RfcEvent

}
