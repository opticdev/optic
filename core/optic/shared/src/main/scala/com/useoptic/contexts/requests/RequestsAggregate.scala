package com.useoptic.contexts.requests

import com.useoptic.contexts.base.BaseCommandContext
import com.useoptic.contexts.requests.Commands._
import com.useoptic.contexts.requests.Events._
import com.useoptic.contexts.rfc.Events.{EventContext, fromCommandContext}
import com.useoptic.contexts.shapes.Commands._
import com.useoptic.contexts.shapes.Events.ShapeAdded
import com.useoptic.contexts.shapes.ShapesHelper.ObjectKind
import com.useoptic.contexts.shapes.{ShapesHelper, ShapesState}
import com.useoptic.contexts.shapes.Validators.ensureShapeIdExists
import com.useoptic.ddd.{Effects, EventSourcedAggregate}

case class RequestsCommandContext(
                                   override val clientId: String,
                                   override val clientSessionId: String,
                                   override val clientCommandBatchId: String,
                                   shapesState: ShapesState
                                 ) extends BaseCommandContext

object RequestsAggregate extends EventSourcedAggregate[RequestsState, RequestsCommand, RequestsCommandContext, RequestsEvent] {
  override def handleCommand(_state: RequestsState): PartialFunction[(RequestsCommandContext, RequestsCommand), Effects[RequestsEvent]] = {
    // remember we're leaving most of the validation to the checkers. only things for internal consistency need to happen here

    case (commandContext: RequestsCommandContext, command: RequestsCommand) => {
      implicit val state = _state
      implicit val shapesState = commandContext.shapesState

      val eventContext: Option[EventContext] = Some(fromCommandContext(commandContext))

      ////////////////////////////////////////////////////////////////////////////////

      command match {
        case AddPathComponent(pathId, parentPathId, name) => {
          Validators.ensurePathComponentIdExists(parentPathId)
          Validators.ensurePathComponentIdAssignable(pathId)
          persist(Events.PathComponentAdded(pathId, parentPathId, name, eventContext))
        }

        case RenamePathComponent(pathId, name) => {
          Validators.ensurePathComponentIdIsNotRoot(pathId)
          Validators.ensurePathComponentIdExists(pathId)
          persist(Events.PathComponentRenamed(pathId, name, eventContext))
        }

        case RemovePathComponent(pathId) => {
          Validators.ensurePathComponentIdIsNotRoot(pathId)
          Validators.ensurePathComponentIdExists(pathId)
          persist(Events.PathComponentRemoved(pathId, eventContext))
        }

        ////////////////////////////////////////////////////////////////////////////////

        case AddPathParameter(pathId, parentPathId, name) => {
          Validators.ensurePathComponentIdExists(parentPathId)
          Validators.ensurePathComponentIdAssignable(pathId)
          persist(
            ShapesHelper.appendDefaultStringTypeEvents(
              Events.PathParameterAdded(pathId, parentPathId, name)
            ): _*
          )
        }

        case SetPathParameterShape(pathId, shapeDescriptor) => {
          Validators.ensurePathComponentIdIsNotRoot(pathId)
          Validators.ensurePathComponentIdExists(pathId)
          ensureShapeIdExists(shapeDescriptor.shapeId)
          persist(Events.PathParameterShapeSet(pathId, shapeDescriptor, eventContext))
        }

        case RenamePathParameter(pathId, name) => {
          Validators.ensurePathComponentIdIsNotRoot(pathId)
          Validators.ensurePathComponentIdExists(pathId)
          persist(Events.PathParameterRenamed(pathId, name, eventContext))
        }

        case RemovePathParameter(pathId) => {
          Validators.ensurePathComponentIdIsNotRoot(pathId)
          Validators.ensurePathComponentIdExists(pathId)
          persist(Events.PathParameterRemoved(pathId, eventContext))
        }

        ////////////////////////////////////////////////////////////////////////////////

        case c: AddRequest => {
          Validators.ensureRequestIdAssignable(c.requestId)
          Validators.ensurePathComponentIdExists(c.pathId)
          val existingRequests = Resolvers.resolveRequests(state, c.pathId, c.httpMethod)
          if (existingRequests.isEmpty) {
            val shapeId = ShapesHelper.newShapeId()
            val queryStringParameterId = RequestsServiceHelper.newParameterId()
            persist(Vector(
              Events.RequestParameterAddedByPathAndMethod(queryStringParameterId, c.pathId, c.httpMethod, "query", "queryString", eventContext),
              ShapeAdded(shapeId, ObjectKind.baseShapeId, DynamicParameterList(Seq.empty), "", eventContext),
              Events.RequestParameterShapeSet(queryStringParameterId, ShapedRequestParameterShapeDescriptor(shapeId, false), eventContext),
              Events.RequestAdded(c.requestId, c.pathId, c.httpMethod, eventContext),
            ).asInstanceOf[Vector[RequestsEvent]]: _*)
          } else {
            persist(Events.RequestAdded(c.requestId, c.pathId, c.httpMethod, eventContext))
          }
        }

        case SetRequestContentType(requestId, contentType) => {
          Validators.ensureRequestIdExists(requestId)
          persist(Events.RequestContentTypeSet(requestId, contentType, eventContext))
        }

        case SetRequestBodyShape(requestId, bodyDescriptor) => {
          Validators.ensureRequestIdExists(requestId)
          ensureShapeIdExists(bodyDescriptor.shapeId)
          persist(Events.RequestBodySet(requestId, bodyDescriptor, eventContext))
        }

        case UnsetRequestBodyShape(requestId) => {
          Validators.ensureRequestIdExists(requestId)
          persist(Events.RequestBodyUnset(requestId, eventContext))
        }

        case RemoveRequest(requestId) => {
          Validators.ensureRequestIdExists(requestId)
          persist(Events.RequestRemoved(requestId, eventContext))
        }

        ////////////////////////////////////////////////////////////////////////////////

        case c: AddResponse => {
          Validators.ensureResponseIdAssignable(c.responseId)
          val request = Validators.ensureRequestIdExists(c.requestId)
          persist(Events.ResponseAddedByPathAndMethod(c.responseId, request.requestDescriptor.pathComponentId, request.requestDescriptor.httpMethod, c.httpStatusCode, eventContext))
        }

        case c: AddResponseByPathAndMethod => {
          Validators.ensureResponseIdAssignable(c.responseId)
          Validators.ensureRequestExists(c.pathId, c.httpMethod)
          persist(Events.ResponseAddedByPathAndMethod(c.responseId, c.pathId, c.httpMethod, c.httpStatusCode, eventContext))
        }

        case SetResponseBodyShape(responseId, bodyDescriptor) => {
          Validators.ensureResponseIdExists(responseId)
          ensureShapeIdExists(bodyDescriptor.shapeId)
          persist(Events.ResponseBodySet(responseId, bodyDescriptor, eventContext))
        }

        case UnsetResponseBodyShape(responseId) => {
          Validators.ensureResponseIdExists(responseId)
          persist(Events.ResponseBodyUnset(responseId, eventContext))
        }

        case SetResponseStatusCode(responseId, httpStatusCode) => {
          Validators.ensureResponseIdExists(responseId)
          persist(Events.ResponseStatusCodeSet(responseId, httpStatusCode, eventContext))
        }

        case SetResponseContentType(responseId, httpContentType) => {
          Validators.ensureResponseIdExists(responseId)
          persist(Events.ResponseContentTypeSet(responseId, httpContentType, eventContext))
        }

        case RemoveResponse(responseId) => {
          Validators.ensureResponseIdExists(responseId)
          persist(Events.ResponseRemoved(responseId, eventContext))
        }

        ////////////////////////////////////////////////////////////////////////////////

        case AddQueryParameter(parameterId, requestId, name) => {
          Validators.ensureRequestIdExists(requestId)
          Validators.ensureParameterIdAssignable(parameterId)
          persist(
            ShapesHelper.appendDefaultStringTypeEvents(
              Events.RequestParameterAdded(parameterId, requestId, "query", name, eventContext),
              eventContext
            ): _*
          )
        }

        case SetQueryParameterShape(parameterId, parameterDescriptor) => {
          Validators.ensureParameterIdExists(parameterId)
          ensureShapeIdExists(parameterDescriptor.shapeId)
          persist(Events.RequestParameterShapeSet(parameterId, parameterDescriptor, eventContext))
        }

        case RenameQueryParameter(parameterId, name) => {
          Validators.ensureParameterIdExists(parameterId)
          persist(Events.RequestParameterRenamed(parameterId, name, eventContext))
        }

        case UnsetQueryParameterShape(parameterId) => {
          Validators.ensureParameterIdExists(parameterId)
          persist(Events.RequestParameterShapeUnset(parameterId, eventContext))
        }

        case RemoveQueryParameter(parameterId) => {
          Validators.ensureParameterIdExists(parameterId)
          persist(Events.RequestParameterRemoved(parameterId, eventContext))
        }

        ////////////////////////////////////////////////////////////////////////////////

        case AddHeaderParameter(parameterId, requestId, name) => {
          Validators.ensureRequestIdExists(requestId)
          Validators.ensureParameterIdAssignable(parameterId)

          persist(
            ShapesHelper.appendDefaultStringTypeEvents(
              Events.RequestParameterAdded(parameterId, requestId, "header", name, eventContext),
              eventContext
            ): _*
          )
        }

        case SetHeaderParameterShape(parameterId, parameterDescriptor) => {
          Validators.ensureParameterIdExists(parameterId)
          ensureShapeIdExists(parameterDescriptor.shapeId)
          persist(Events.RequestParameterShapeSet(parameterId, parameterDescriptor, eventContext))
        }

        case RenameHeaderParameter(parameterId, name) => {
          Validators.ensureParameterIdExists(parameterId)
          persist(Events.RequestParameterRenamed(parameterId, name, eventContext))
        }

        case UnsetHeaderParameterShape(parameterId) => {
          Validators.ensureParameterIdExists(parameterId)
          persist(Events.RequestParameterShapeUnset(parameterId, eventContext))
        }

        case RemoveHeaderParameter(parameterId) => {
          Validators.ensureParameterIdExists(parameterId)
          persist(Events.RequestParameterRemoved(parameterId, eventContext))
        }
      }
    }
  }

  override def applyEvent(event: RequestsEvent, state: RequestsState): RequestsState = event match {

    ////////////////////////////////////////////////////////////////////////////////

    case e: PathComponentAdded => {
      state.withPathComponent(e.pathId, e.parentPathId, e.name)
    }

    case e: PathComponentRemoved => {
      state.withoutPathComponent(e.pathId)
    }

    case e: PathComponentRenamed => {
      state.withPathComponentNamed(e.pathId, e.name)
    }

    ////////////////////////////////////////////////////////////////////////////////

    case e: PathParameterAdded => {
      state.withPathParameter(e.pathId, e.parentPathId, e.name)
    }

    case e: PathParameterRemoved => {
      state.withoutPathParameter(e.pathId)
    }

    case e: PathParameterRenamed => {
      state.withPathParameterNamed(e.pathId, e.name)
    }

    case e: PathParameterShapeSet => {
      state.withPathParameterShape(e.pathId, e.shapeDescriptor)
    }

    ////////////////////////////////////////////////////////////////////////////////

    case e: RequestAdded => {
      state.withRequest(e.requestId, e.pathId, e.httpMethod)
    }

    case e: RequestContentTypeSet => {
      state.withRequestContentType(e.requestId, e.httpContentType)
    }

    case e: RequestRemoved => {
      state.withoutRequest(e.requestId)
    }

    case e: RequestBodySet => {
      state.withRequestBody(e.requestId, e.bodyDescriptor)
    }

    case e: RequestBodyUnset => {
      val r = state.requests(e.requestId)
      r.requestDescriptor.bodyDescriptor match {
        case ShapedBodyDescriptor(httpContentType, conceptId, _) => {
          state.withRequestBody(e.requestId, ShapedBodyDescriptor(httpContentType, conceptId, isRemoved = true))
        }
        case UnsetBodyDescriptor() => state
      }
    }

    ////////////////////////////////////////////////////////////////////////////////

    case e: ResponseAdded => {
      state.withResponse(e.responseId, e.requestId, e.httpStatusCode)
    }

    case e:ResponseAddedByPathAndMethod => {
      state.withResponseByPathAndMethod(e.responseId, e.pathId, e.httpMethod, e.httpStatusCode)
    }

    case e: ResponseContentTypeSet => {
      state.withResponseContentType(e.responseId, e.httpContentType)
    }

    case e: ResponseStatusCodeSet => {
      state.withResponseStatusCode(e.responseId, e.httpStatusCode)
    }

    case e: ResponseBodySet => {
      state.withResponseBody(e.responseId, e.bodyDescriptor)
    }

    case e: ResponseBodyUnset => {
      val r = state.responses(e.responseId)
      r.responseDescriptor.bodyDescriptor match {
        case ShapedBodyDescriptor(httpContentType, conceptId, _) => {
          state.withResponseBody(e.responseId, ShapedBodyDescriptor(httpContentType, conceptId, isRemoved = true))

        }
        case UnsetBodyDescriptor() => state
      }
    }

    case e: ResponseRemoved => {
      state.withoutResponse(e.responseId)
    }

    ////////////////////////////////////////////////////////////////////////////////

    case e: RequestParameterAdded => {
      state.withRequestParameter(e.parameterId, e.requestId, e.parameterLocation, e.name)
    }

    case e: RequestParameterAddedByPathAndMethod => {
      state.withRequestParameterByPathAndMethod(e.parameterId, e.pathId, e.httpMethod, e.parameterLocation, e.name)
    }

    case e: RequestParameterShapeSet => {
      state.withRequestParameterShape(e.parameterId, e.parameterDescriptor)
    }

    case e: RequestParameterRenamed => {
      state.withRequestParameterName(e.parameterId, e.name)
    }

    case e: RequestParameterShapeUnset => {
      val s = state.requestParameters(e.parameterId)
      s.requestParameterDescriptor.shapeDescriptor match {
        case ShapedRequestParameterShapeDescriptor(conceptId, _) => {
          state.withRequestParameterShape(e.parameterId, ShapedRequestParameterShapeDescriptor(conceptId, isRemoved = true))
        }

        case UnsetRequestParameterShapeDescriptor() => state
      }
    }

    case e: RequestParameterRemoved => {
      state.withoutRequestParameter(e.parameterId)
    }

    case _ => state
  }

  override def initialState: RequestsState = RequestsState(
    Map(rootPathId -> PathComponent(rootPathId, BasicPathComponentDescriptor(null, ""), isRemoved = false)),
    Map.empty,
    Map.empty,
    Map.empty,
    Map.empty
  )
}
