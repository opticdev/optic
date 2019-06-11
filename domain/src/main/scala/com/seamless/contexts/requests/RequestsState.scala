package com.seamless.contexts.requests

import com.seamless.contexts.requests.Commands.{BodyDescriptor, ParameterId, PathComponentId, RequestId, ResponseId, UnsetBodyDescriptor}

sealed trait RequestsGraph

trait Removable {
  val isRemoved: Boolean
}

case class PathComponent(pathId: PathComponentId, parentPathId: PathComponentId, name: String, isParameter: Boolean, override val isRemoved: Boolean) extends RequestsGraph with Removable

case class HttpRequestParameter(parameterId: ParameterId, name: String, override val isRemoved: Boolean) extends RequestsGraph with Removable

case class RequestDescriptor(pathComponentId: PathComponentId, httpMethod: String, bodyDescriptor: BodyDescriptor)
case class HttpRequest(requestId: RequestId, requestDescriptor: RequestDescriptor, override val isRemoved: Boolean) extends RequestsGraph with Removable

case class ResponseDescriptor(requestId: RequestId, httpStatusCode: Int, bodyDescriptor: BodyDescriptor)
case class HttpResponse(responseId: ResponseId, responseDescriptor: ResponseDescriptor, override val isRemoved: Boolean) extends RequestsGraph with Removable

case class HttpResponseBody(bodyDescriptor: BodyDescriptor)

case class RequestsState(
                          pathComponents: Map[PathComponentId, PathComponent],
                          requests: Map[RequestId, HttpRequest],
                          requestParameters: Map[ParameterId, HttpRequestParameter],
                          responses: Map[ResponseId, HttpResponse],
                          parentPath: Map[PathComponentId, PathComponentId],
                          requestsByPath: Map[PathComponentId, Set[RequestId]],
                          responsesByRequest: Map[RequestId, Set[ResponseId]]
                        ) {
  ////////////////////////////////////////////////////////////////////////////////

  def withPathComponent(pathId: PathComponentId, parentPathId: PathComponentId, name: String) = {
    this.copy(
      pathComponents = pathComponents + (pathId -> PathComponent(pathId, parentPathId, name, isParameter = false, isRemoved = false)),
      parentPath = parentPath + (pathId -> parentPathId),
      requestsByPath = requestsByPath + (pathId -> Set.empty),
    )
  }

  def withPathComponentNamed(pathId: PathComponentId, name: String) = {
    parentPath.get(pathId) match {
      case Some(parentPathId) => {
        withPathComponent(pathId, parentPathId, name)
      }
    }
  }

  def withoutPathComponent(pathIdToRemove: PathComponentId) = {
    val path = pathComponents.get(pathIdToRemove)
    path match {
      case Some(PathComponent(pathId, parentPathId, name, isParameter, _)) => {
        this.copy(
          pathComponents = pathComponents + (pathId -> PathComponent(pathId, parentPathId, name, isParameter = isParameter, isRemoved = true)),
        )
      }
    }
  }

  ////////////////////////////////////////////////////////////////////////////////

  def withRequest(requestId: RequestId, pathId: PathComponentId, httpMethod: String) = {
    this.copy(
      requests = requests + (requestId -> HttpRequest(requestId, RequestDescriptor(pathId, httpMethod, UnsetBodyDescriptor()), isRemoved = false)),
      requestsByPath = requestsByPath + (pathId -> (requestsByPath.getOrElse(pathId, Set.empty) + requestId))
    )
  }

  def withoutRequest(requestIdToRemove: RequestId) = {
    match requests.get(requestIdToRemove) {
      case Some(HttpRequest(requestId, requestDescriptor, isRemoved)) => {
        this.copy(
          requests = requests + (requestId -> HttpRequest(requestId, requestDescriptor, isRemoved = true))
        )
      }
    }
  }

  ////////////////////////////////////////////////////////////////////////////////

}
