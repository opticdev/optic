package com.useoptic.diff.interactions

import com.useoptic.contexts.requests.{Commands, RequestsState, Utilities}
import com.useoptic.types.capture.HttpInteraction


object Resolvers {
  def resolveOperations(interaction: HttpInteraction, pathId: Commands.PathComponentId, requestsState: RequestsState) = {
    requestsState.requests.values
      .filter(r => (
        r.requestDescriptor.pathComponentId == pathId
          && r.requestDescriptor.httpMethod == interaction.request.method
        )
      )
  }

  def resolveResponses(interaction: HttpInteraction, requestId: Commands.RequestId, requestsState: RequestsState) = {
    val request = requestsState.requests(requestId)
    println(requestsState.responses.values)
    requestsState.responses.values
      .filter(r => {
        (
          r.responseDescriptor.pathId == request.requestDescriptor.pathComponentId
            && r.responseDescriptor.httpMethod == request.requestDescriptor.httpMethod
            && r.responseDescriptor.httpStatusCode == interaction.response.statusCode
          )
      })
  }
}