package com.seamless.contexts.requests

import com.seamless.contexts.requests.Commands.{PathComponentId, RequestId, ResponseId}

case class PathComponent(pathId: PathComponentId, parentPathId: PathComponentId, name: String, isParameter: Boolean, isRemoved: Boolean)

case class HttpRequestDefinition(requestId: RequestId, pathId: PathComponentId, method: String)

case class HttpResponseDefinition(responseId: ResponseId, requestId: RequestId, httpStatusCode: Integer)

case class RequestsState(
                          pathComponents: Map[PathComponentId, PathComponent],
                          requests: Map[PathComponentId, Map[RequestId, HttpRequestDefinition]],
                          responses: Map[RequestId, Map[ResponseId, HttpResponseDefinition]]
                        ) {

  def addPathComponent(pathId: PathComponentId, parentPathId: PathComponentId, name: String) = {
    val pathComponent = PathComponent(pathId = pathId, parentPathId = parentPathId, name = name, isParameter = false, isRemoved = false)

    RequestsState(
      pathComponents + (pathId -> pathComponent),
      requests,
      responses
    )
  }

  def addRequestDefinition(pathId: PathComponentId, requestId: RequestId, method: String) = {
    require(pathComponents.contains(pathId))
    val requestDefinitions = requests.getOrElse(pathId, Map.empty)
    require(!requestDefinitions.contains(requestId))
    val requestDefinition = HttpRequestDefinition(requestId, pathId, method)
    RequestsState(
      pathComponents,
      requests + (pathId -> (requestDefinitions + (requestId -> requestDefinition))),
      responses
    )
  }

  def addResponseDefinition(responseId: ResponseId, requestId: RequestId, httpStatusCode: Integer) = {
    val requestIdExists = requests.exists(entry => {
      entry._2.contains(requestId)
    })
    require(requestIdExists)
    val responseDefinitions = responses.getOrElse(requestId, Map.empty)
    require(!responseDefinitions.contains(responseId))
    val responseDefinition = HttpResponseDefinition(responseId, requestId, httpStatusCode)
    RequestsState(
      pathComponents,
      requests,
      responses + (requestId -> (responseDefinitions + (responseId -> responseDefinition)))
    )
  }
}
