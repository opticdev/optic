package com.useoptic.contexts.requests

import com.useoptic.contexts.requests.Commands.{rootPathId, RequestParameterId, PathComponentId, RequestId, ResponseId}

object Validators {
  def ensureParameterIdExists(parameterId: RequestParameterId)(implicit state: RequestsState) = {
    require(state.requestParameters.contains(parameterId))
  }

  def ensureParameterIdAssignable(parameterId: RequestParameterId)(implicit state: RequestsState) = {
    require(!state.requestParameters.contains(parameterId))
  }

  def ensurePathComponentIdAssignable(id: PathComponentId)(implicit state: RequestsState) = {
    require(!state.pathComponents.contains(id))
  }

  def ensurePathComponentIdExists(id: PathComponentId)(implicit state: RequestsState) = {
    require(state.pathComponents.contains(id))
  }

  def ensureRequestIdAssignable(id: RequestId)(implicit state: RequestsState) = {
    require(!state.requests.contains(id))
  }

  def ensureRequestIdExists(id: RequestId)(implicit state: RequestsState) = {
    require(state.requests.contains(id))
  }

  def ensureResponseIdAssignable(id: ResponseId)(implicit state: RequestsState) = {
    require(!state.responses.contains(id))
  }

  def ensureResponseIdExists(id: ResponseId)(implicit state: RequestsState) = {
    require(state.responses.contains(id))
  }

  def ensurePathComponentIdIsNotRoot(id: PathComponentId)(implicit state: RequestsState) = {
    require(id != rootPathId)
  }
}
