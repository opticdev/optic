package com.seamless.contexts.requests

import com.seamless.contexts.base.BaseCommandContext
import com.seamless.contexts.data_types.DataTypesState
import com.seamless.contexts.requests.Commands._
import com.seamless.contexts.requests.Events._
import com.seamless.ddd.{Effects, EventSourcedAggregate}
import com.seamless.contexts.data_types.Validators.requireConceptId

case class RequestsCommandContext(dataTypesState: DataTypesState) extends BaseCommandContext

object RequestsAggregate extends EventSourcedAggregate[RequestsState, RequestsCommand, RequestsCommandContext, RequestsEvent] {
  override def handleCommand(_state: RequestsState): PartialFunction[(RequestsCommandContext, RequestsCommand), Effects[RequestsEvent]] = {
    // remember we're leaving most of the validation to the checkers. only things for internal consistency need to happen here

    case (context: RequestsCommandContext, command: RequestsCommand) => {
      implicit val state = _state
      implicit val dataTypesState = context.dataTypesState
      ////////////////////////////////////////////////////////////////////////////////
      command match {
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
          persist(Events.PathParameterAdded(pathId, parentPathId, name))
        }

        case SetPathParameterShape(pathId, shapeDescriptor) => {
          Validators.ensurePathComponentIdIsNotRoot(pathId)
          Validators.ensurePathComponentIdExists(pathId)
          requireConceptId(shapeDescriptor.conceptId)
          persist(Events.PathParameterShapeSet(pathId, shapeDescriptor))
        }

        case RenamePathParameter(pathId, name) => {
          Validators.ensurePathComponentIdIsNotRoot(pathId)
          Validators.ensurePathComponentIdExists(pathId)
          persist(Events.PathParameterRenamed(pathId, name))
        }

        case RemovePathParameter(pathId) => {
          Validators.ensurePathComponentIdIsNotRoot(pathId)
          Validators.ensurePathComponentIdExists(pathId)
          persist(Events.PathParameterRemoved(pathId))
        }

        ////////////////////////////////////////////////////////////////////////////////

        case AddRequest(requestId, pathId, httpMethod) => {
          Validators.ensureRequestIdAssignable(requestId)
          Validators.ensurePathComponentIdExists(pathId)
          persist(Events.RequestAdded(requestId, pathId, httpMethod))
        }

        case SetRequestBodyShape(requestId, bodyDescriptor) => {
          Validators.ensureRequestIdExists(requestId)
          requireConceptId(bodyDescriptor.conceptId)
          persist(Events.RequestBodySet(requestId, bodyDescriptor))
        }

        case UnsetRequestBodyShape(requestId) => {
          Validators.ensureRequestIdExists(requestId)
          persist(Events.RequestBodyUnset(requestId))
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
          requireConceptId(bodyDescriptor.conceptId)
          persist(Events.ResponseBodySet(responseId, bodyDescriptor))
        }

        case UnsetResponseBodyShape(responseId) => {
          Validators.ensureResponseIdExists(responseId)
          persist(Events.ResponseBodyUnset(responseId))
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
          persist(Events.RequestParameterAdded(parameterId, requestId, "query", name))
        }

        case SetQueryParameterShape(parameterId, parameterDescriptor) => {
          Validators.ensureParameterIdExists(parameterId)
          requireConceptId(parameterDescriptor.conceptId)
          persist(Events.RequestParameterShapeSet(parameterId, parameterDescriptor))
        }

        case RenameQueryParameter(parameterId, name) => {
          Validators.ensureParameterIdExists(parameterId)
          persist(Events.RequestParameterRenamed(parameterId, name))
        }

        case UnsetQueryParameterShape(parameterId) => {
          Validators.ensureParameterIdExists(parameterId)
          persist(Events.RequestParameterShapeUnset(parameterId))
        }

        case RemoveQueryParameter(parameterId) => {
          Validators.ensureParameterIdExists(parameterId)
          persist(Events.RequestParameterRemoved(parameterId))
        }

        ////////////////////////////////////////////////////////////////////////////////

        case AddHeaderParameter(parameterId, requestId, name) => {
          Validators.ensureRequestIdExists(requestId)
          Validators.ensureParameterIdAssignable(parameterId)
          persist(Events.RequestParameterAdded(parameterId, requestId, "header", name))
        }

        case SetHeaderParameterShape(parameterId, parameterDescriptor) => {
          Validators.ensureParameterIdExists(parameterId)
          requireConceptId(parameterDescriptor.conceptId)
          persist(Events.RequestParameterShapeSet(parameterId, parameterDescriptor))
        }

        case RenameHeaderParameter(parameterId, name) => {
          Validators.ensureParameterIdExists(parameterId)
          persist(Events.RequestParameterRenamed(parameterId, name))
        }

        case UnsetHeaderParameterShape(parameterId) => {
          Validators.ensureParameterIdExists(parameterId)
          persist(Events.RequestParameterShapeUnset(parameterId))
        }

        case RemoveHeaderParameter(parameterId) => {
          Validators.ensureParameterIdExists(parameterId)
          persist(Events.RequestParameterRemoved(parameterId))
        }
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

    case PathParameterAdded(pathId, parentPathId, name) => {
      state.withPathParameter(pathId, parentPathId, name)
    }

    case PathParameterRemoved(pathId) => {
      state.withoutPathParameter(pathId)
    }

    case PathParameterRenamed(pathId, name) => {
      state.withPathParameterNamed(pathId, name)
    }

    case PathParameterShapeSet(pathId, parameterShapeDescriptor) => {
      state.withPathParameterShape(pathId, parameterShapeDescriptor)
    }

    ////////////////////////////////////////////////////////////////////////////////

    case RequestAdded(requestId, pathId, httpMethod) => {
      state.withRequest(requestId, pathId, httpMethod)
    }

    case RequestRemoved(requestId) => {
      state.withoutRequest(requestId)
    }

    case RequestBodySet(requestId, bodyDescriptor) => {
      state.withRequestBody(requestId, bodyDescriptor)
    }

    case RequestBodyUnset(requestId) => {
      val r = state.requests(requestId)
      r.requestDescriptor.bodyDescriptor match {
        case ShapedBodyDescriptor(httpContentType, conceptId, _) => {
          state.withRequestBody(requestId, ShapedBodyDescriptor(httpContentType, conceptId, isRemoved = true))
        }
        case UnsetBodyDescriptor() => state
      }
    }

    ////////////////////////////////////////////////////////////////////////////////

    case ResponseAdded(responseId, requestId, httpStatusCode) => {
      state.withResponse(responseId, requestId, httpStatusCode)
    }

    case ResponseStatusCodeSet(responseId, httpStatusCode) => {
      state.withResponseStatusCode(responseId, httpStatusCode)
    }

    case ResponseBodySet(responseId, bodyDescriptor) => {
      state.withResponseBody(responseId, bodyDescriptor)
    }

    case ResponseBodyUnset(responseId) => {
      val r = state.responses(responseId)
      r.responseDescriptor.bodyDescriptor match {
        case ShapedBodyDescriptor(httpContentType, conceptId, _) => {
          state.withResponseBody(responseId, ShapedBodyDescriptor(httpContentType, conceptId, isRemoved = true))

        }
        case UnsetBodyDescriptor() => state
      }
    }

    case ResponseRemoved(responseId) => {
      state.withoutResponse(responseId)
    }

    ////////////////////////////////////////////////////////////////////////////////

    case RequestParameterAdded(parameterId, requestId, parameterLocation, name) => {
      state.withRequestParameter(parameterId, requestId, parameterLocation, name)
    }

    case RequestParameterShapeSet(parameterId, parameterDescriptor) => {
      state.withRequestParameterShape(parameterId, parameterDescriptor)
    }

    case RequestParameterRenamed(parameterId, name) => {
      state.withRequestParameterName(parameterId, name)
    }

    case RequestParameterShapeUnset(parameterId) => {
      val s = state.requestParameters(parameterId)
      s.requestParameterDescriptor.shapeDescriptor match {
        case ShapedRequestParameterShapeDescriptor(conceptId, _) => {
          state.withRequestParameterShape(parameterId, ShapedRequestParameterShapeDescriptor(conceptId, isRemoved = true))
        }

        case UnsetRequestParameterShapeDescriptor() => state
      }
    }

    case RequestParameterRemoved(parameterId) => {
      state.withoutRequestParameter(parameterId)
    }
  }

  override def initialState: RequestsState = RequestsState(
    Map(rootPathId -> PathComponent(rootPathId, BasicPathComponentDescriptor(null, ""), isRemoved = false)),
    Map.empty,
    Map.empty,
    Map.empty,
    Map.empty
  )
}
