package com.useoptic.contexts.requests

import com.useoptic.contexts.requests.Commands.{rootPathId, RequestParameterId, PathComponentId, RequestId, ResponseId}

object Validators {
  def ensureRequestExists(pathId: PathComponentId, httpMethod: String)(implicit state: RequestsState) = {
    val requests = state.requests.values.filter(x => x.requestDescriptor.pathComponentId == pathId && x.requestDescriptor.httpMethod == httpMethod)
    require(requests.size >= 1, "Expected to find exactly one requestId for the path and method")
  }

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
    state.requests(id)
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
