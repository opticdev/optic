package com.seamless.contexts.requests

import com.seamless.contexts.data_types.DataTypesState
import com.seamless.contexts.requests.Commands._
import com.seamless.contexts.requests.Events._
import com.seamless.ddd.{Effects, EventSourcedAggregate}
import com.seamless.contexts.data_types.Validators.{requireId}

case class RequestsCommandContext(dataTypesState: DataTypesState)

object RequestsAggregate extends EventSourcedAggregate[RequestsState, RequestsCommand, RequestsCommandContext, RequestsEvent] {
  override def handleCommand(_state: RequestsState, _context: RequestsCommandContext): PartialFunction[RequestsCommand, Effects[RequestsEvent]] = {
    implicit val state = _state
    implicit val dataTypesState = _context.dataTypesState

    // remember we're leaving most of the validation to the checkers. only things for internal consistency need to happen here
    {
      ////////////////////////////////////////////////////////////////////////////////

      case AddPathComponent(pathId, parentPathId, name) => {
        Validators.ensurePathComponentIdExists(parentPathId)
        Validators.ensurePathComponentIdAssignable(pathId)
        persist(Events.PathComponentAdded(pathId, parentPathId, name))
      }

      case RenamePathComponent(pathId, name) => {
        Validators.ensurePathComponentIdIsNotRoot(pathId)
        Validators.ensurePathComponentIdExists(pathId)
        persist(Events.PathComponentRenamed(pathId, name))
      }

      case RemovePathComponent(pathId) => {
        Validators.ensurePathComponentIdIsNotRoot(pathId)
        Validators.ensurePathComponentIdExists(pathId)
        persist(Events.PathComponentRemoved(pathId))
      }

      ////////////////////////////////////////////////////////////////////////////////

      case AddPathParameter(pathId, parentPathId, name) => {
        Validators.ensurePathComponentIdExists(parentPathId)
        Validators.ensurePathComponentIdAssignable(pathId)
        persist(Events.PathParameterAdded(pathId, name))
      }

      case SetPathParameterShape(pathId, shapeId) => {
        Validators.ensurePathComponentIdIsNotRoot(pathId)
        Validators.ensurePathComponentIdExists(pathId)
        requireId(shapeId)
        persist(Events.PathParameterShapeSet(pathId, shapeId))
      }

      case RemovePathParameter(pathId) => {
        Validators.ensurePathComponentIdIsNotRoot(pathId)
        Validators.ensurePathComponentIdExists(pathId)
        persist(Events.PathParameterRemoved(pathId))
      }

      ////////////////////////////////////////////////////////////////////////////////

      case AddRequest(requestId, pathId, httpMethod) => {
        Validators.ensurePathComponentIdIsNotRoot(pathId)
        Validators.ensureRequestIdAssignable(requestId)
        Validators.ensurePathComponentIdExists(pathId)
        persist(Events.RequestAdded(requestId, pathId, httpMethod))
      }

      case SetRequestBodyShape(requestId, bodyDescriptor) => {
        Validators.ensureRequestIdExists(requestId)
        requireId(bodyDescriptor.bodyShapeId)
        persist(Events.RequestBodySet(requestId, bodyDescriptor))
      }

      case RemoveRequest(requestId) => {
        Validators.ensureRequestIdExists(requestId)
        persist(Events.RequestRemoved(requestId))
      }

      ////////////////////////////////////////////////////////////////////////////////

      case AddResponse(responseId, requestId, httpMethod) => {
        Validators.ensureResponseIdAssignable(responseId)
        Validators.ensureRequestIdExists(requestId)
        persist(Events.ResponseAdded(responseId, requestId, httpMethod))
      }

      case SetResponseBodyShape(responseId, bodyDescriptor) => {
        Validators.ensureResponseIdExists(responseId)
        requireId(bodyDescriptor.bodyShapeId)
        persist(Events.ResponseBodySet(responseId, bodyDescriptor))
      }

      case SetResponseStatusCode(responseId, httpStatusCode) => {
        Validators.ensureResponseIdExists(responseId)
        persist(Events.ResponseStatusCodeSet(responseId, httpStatusCode))
      }

      case RemoveResponse(responseId) => {
        Validators.ensureResponseIdExists(responseId)
        persist(Events.ResponseRemoved(responseId))
      }

      ////////////////////////////////////////////////////////////////////////////////

      case AddQueryParameter(parameterId, requestId, name) => {
        Validators.ensureRequestIdExists(requestId)
        Validators.ensureParameterIdAssignable(parameterId)
        persist(Events.QueryParameterAdded(parameterId, requestId, name))
      }

      case SetQueryParameterShape(parameterId, shapeId) => {
        Validators.ensureParameterIdExists(parameterId)
        requireId(shapeId)
        persist(Events.QueryParameterShapeSet(parameterId, shapeId))
      }

      case RemoveQueryParameter(parameterId) => {
        Validators.ensureParameterIdExists(parameterId)
        persist(Events.QueryParameterRemoved(parameterId))
      }

      ////////////////////////////////////////////////////////////////////////////////

      case AddHeaderParameter(parameterId, requestId, name) => {
        Validators.ensureRequestIdExists(requestId)
        Validators.ensureParameterIdAssignable(parameterId)
        persist(Events.HeaderParameterAdded(parameterId, requestId, name))
      }

      case SetHeaderParameterShape(parameterId, shapeId) => {
        Validators.ensureParameterIdExists(parameterId)
        requireId(shapeId)
        persist(Events.HeaderParameterShapeSet(parameterId, shapeId))
      }

      case RemoveHeaderParameter(parameterId) => {
        Validators.ensureParameterIdExists(parameterId)
        persist(Events.HeaderParameterRemoved(parameterId))
      }
    }
  }

  override def applyEvent(event: RequestsEvent, state: RequestsState): RequestsState = event match {

    ////////////////////////////////////////////////////////////////////////////////
    case PathComponentAdded(pathId, parentPathId, name) => {
      state.withPathComponent(pathId, parentPathId, name)
    }

    case PathComponentRemoved(pathId) => {
      state.withoutPathComponent(pathId)
    }

    case PathComponentRenamed(pathId, name) => {
      state.withPathComponentNamed(pathId, name)
    }
    ////////////////////////////////////////////////////////////////////////////////
    case RequestAdded(requestId, pathId, httpMethod) => {

    }
  }

  override def initialState: RequestsState = RequestsState(
    Map("root" -> PathComponent("root", null, "", isParameter = false, isRemoved = false)),
    Map.empty,
    Map.empty,
    Map.empty,
    Map.empty,
    Map.empty,
    Map.empty
  )
}
