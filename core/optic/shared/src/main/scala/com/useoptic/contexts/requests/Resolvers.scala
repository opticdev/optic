package com.useoptic.contexts.requests

import com.useoptic.contexts.requests.Commands.PathComponentId

object Resolvers {
  def resolveRequests(requestsState: RequestsState, pathId: PathComponentId, httpMethod: String) = {
    requestsState.requests.values.filter(x => x.requestDescriptor.pathComponentId == pathId && x.requestDescriptor.httpMethod == httpMethod)
  }
}
