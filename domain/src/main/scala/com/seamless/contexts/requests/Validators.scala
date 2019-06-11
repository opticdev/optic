package com.seamless.contexts.requests

import com.seamless.contexts.requests.Commands.{ParameterId, PathComponentId, RequestId, ResponseId}

object Validators {
  def ensureParameterIdExists(parameterId: ParameterId)(implicit state: RequestsState) = {
    require(state.requestParameters.contains(parameterId))
  }

  def ensureParameterIdAssignable(parameterId: ParameterId)(implicit state: RequestsState) = {
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
    require(id != "root")
  }
}