package com.seamless.contexts.rest
import com.seamless.contexts.rest.Commands._
import com.seamless.contexts.rest.Events._
import com.seamless.ddd.{Effects, EventSourcedAggregate}

object RestAggregate extends EventSourcedAggregate[RestState, RestCommand, RestEvent] {
  override def handleCommand(state: RestState): PartialFunction[RestCommand, Effects[RestEvent]] = {

    case CreateEndpoint(endpointId, method, path) =>
      persist(CreatedEndpoint(endpointId, method, path))
    case SetMethod(method, endpointId) => {
      require(state.endpointExists(endpointId), s"Endpoint ${endpointId} does not exist")
      persist(MethodUpdated(method, endpointId))
    }
    case SetPath(path, endpointId) => {
      require(state.endpointExists(endpointId), s"Endpoint ${endpointId} does not exist")
      persist(PathUpdated(path, endpointId))
    }
    case AddResponse(responseId, status, endpointId) => {
      require(state.endpointExists(endpointId), s"Endpoint ${endpointId} does not exist")
      persist(AddedResponse(responseId, status, endpointId))
    }

    case SetResponseStatus(responseId, status, endpointId) => {
      require(state.endpointExists(endpointId), s"Endpoint ${endpointId} does not exist")
      persist(ResponseStatusChanged(responseId, status, endpointId))
    }

    case AddResponseBody(id, rootShapeId, contentType, responseId, endpointId) => {
      require(state.endpointExists(endpointId), s"Endpoint ${endpointId} does not exist")
      persist(AddedResponseBody(id, rootShapeId, contentType, responseId, endpointId))
    }

    case RemoveResponseBody(id, responseId, endpointId) => {
      require(state.endpointExists(endpointId), s"Endpoint ${endpointId} does not exist")
      persist(RemovedResponseBody(id, responseId, endpointId))
    }

    case AddRequestBody(requestBodyId, rootShapeId, contentType, endpointId) => {
      require(state.endpointExists(endpointId), s"Endpoint ${endpointId} does not exist")
      require(state.endpoints(endpointId).method.hasRequestBody, s"Endpoint ${endpointId} does not support a request body")
      require(!(!contentType.hasSchema && rootShapeId.isDefined), s"Schemas can not be defined for ${contentType.raw}}")

      persist(AddedRequestBody(requestBodyId, rootShapeId, contentType, endpointId))
    }

    case RemoveRequestBody(requestBodyId, endpointId) => {
      require(state.endpointExists(endpointId), s"Endpoint ${endpointId} does not exist")
      persist(RemovedRequestBody(requestBodyId, endpointId))
    }

    case _ => noEffect()
  }

  override def applyEvent(event: RestEvent, state: RestState): RestState = {
    event match {

      case CreatedEndpoint(endpointId, method, path) => {
        state.putEndpoint(endpointId, Endpoint.default(path, method))
      }

      case MethodUpdated(method, endpointId) => {
        state.updateEndpoint(endpointId){ endpoint =>
          endpoint.copy(method = method)
        }
      }

      case PathUpdated(path, endpointId) => {
        state.updateEndpoint(endpointId){ endpoint =>
          endpoint.copy(path = path)
        }
      }

      case AddedResponse(responseId, status, endpointId) => {
        val response = Response(status, Vector())
        state.update(
          s => s.putResponse(responseId, response),
          s => s.updateEndpoint(endpointId) { endpoint =>
            endpoint.appendResponse(responseId)
          }
        )
      }

      case AddedResponseBody(id, rootShapeId, contentType, responseId, endpointId) => {
        val body = Body(contentType, rootShapeId)
        val response = state.responses(responseId)

        state.update(
          s => s.putBody(id, body),
          s => s.putResponse(responseId, response.appendBody(id))
        )
      }

      case RemovedResponseBody(id, responseId, endpointId) => {
        val updated = state.responses(responseId)
            .removeBody(id)
        state.putResponse(responseId, updated)
      }

      case AddedRequestBody(id, rootShapeId, contentType, endpointId) => {
        val body = Body(contentType, rootShapeId)

        state.update(
          s => s.putBody(id, body),
          s => s.updateEndpoint(endpointId){ endpoint =>
            endpoint.appendRequestBody(id)
          }
        )
      }

      case RemovedRequestBody(id, endpointId) => {
        state.updateEndpoint(endpointId) { endpoint =>
          val bodies = endpoint.requestBodies.filterNot(i => i == id)
          endpoint.copy(requestBodies = bodies)
        }
      }

      case _ => state
    }
  }

  override def initialState: RestState = RestState()
}
