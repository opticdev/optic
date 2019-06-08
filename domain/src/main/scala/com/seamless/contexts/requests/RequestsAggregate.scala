package com.seamless.contexts.requests

import com.seamless.contexts.requests.Commands._
import com.seamless.contexts.requests.Events._
import com.seamless.ddd.{Effects, EventSourcedAggregate}

object RequestsAggregate extends EventSourcedAggregate[RequestsState, RequestsCommand, RequestsEvent] {
  override def handleCommand(_state: RequestsState): PartialFunction[RequestsCommand, Effects[RequestsEvent]] = {
    implicit val state = _state

    // remember we're leaving most of the validation to the checkers. only things for internal consistency need to happen here
    {
      case AddPathComponent(pathId, parentPathId, name) => {
        Validators.ensurePathComponentIdExists(parentPathId)
        Validators.ensurePathComponentIdDoesNotExist(pathId)
        persist(Events.PathComponentAdded(pathId, parentPathId, name))
      }
    }
  }

  override def applyEvent(event: RequestsEvent, state: RequestsState): RequestsState = event match {

    case PathComponentAdded(pathId, parentPathId, name) => {
      state.addPathComponent(pathId, parentPathId, name)
    }

  }

  override def initialState: RequestsState = RequestsState(
    Map("root" -> PathComponent("root", null, "", false, false)),
    Map.empty,
    Map.empty
  )
}

object Validators {
  def ensurePathComponentIdDoesNotExist(id: PathComponentId)(implicit state: RequestsState) = {
    require(!state.pathComponents.contains(id))
  }

  def ensurePathComponentIdExists(id: PathComponentId)(implicit state: RequestsState) = {
    require(state.pathComponents.contains(id))
  }


  def ensureRequestIdDoesNotExist(id: RequestId)(implicit state: RequestsState) = {

  }

  def ensureRequestIdExists(id: RequestId)(implicit state: RequestsState) = {

  }

  def ensureResponseIdDoesNotExist(id: ResponseId)(implicit state: RequestsState) = {

  }

  def ensureResponseIdExists(id: ResponseId)(implicit state: RequestsState) = {

  }
}
