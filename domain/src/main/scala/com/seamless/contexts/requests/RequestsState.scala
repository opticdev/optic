package com.seamless.contexts.requests

import com.seamless.contexts.requests.Commands.{BasicPathComponentDescriptor, BodyDescriptor, ParameterizedPathComponentDescriptor, PathComponentDescriptor, PathComponentId, RequestId, RequestParameterId, RequestParameterShapeDescriptor, ResponseId, ShapedBodyDescriptor, ShapedRequestParameterShapeDescriptor, UnsetBodyDescriptor, UnsetRequestParameterShapeDescriptor}

sealed trait RequestsGraph

trait Removable {
  val isRemoved: Boolean
}

case class PathComponent(pathId: PathComponentId, descriptor: PathComponentDescriptor, override val isRemoved: Boolean) extends RequestsGraph with Removable

case class RequestParameterDescriptor(requestId: RequestId, location: String, name: String, shapeDescriptor: RequestParameterShapeDescriptor)
case class HttpRequestParameter(parameterId: RequestParameterId, requestParameterDescriptor: RequestParameterDescriptor, override val isRemoved: Boolean) extends RequestsGraph with Removable

case class RequestDescriptor(pathComponentId: PathComponentId, httpMethod: String, bodyDescriptor: BodyDescriptor)
case class HttpRequest(requestId: RequestId, requestDescriptor: RequestDescriptor, override val isRemoved: Boolean) extends RequestsGraph with Removable

case class ResponseDescriptor(requestId: RequestId, httpStatusCode: Int, bodyDescriptor: BodyDescriptor)
case class HttpResponse(responseId: ResponseId, responseDescriptor: ResponseDescriptor, override val isRemoved: Boolean) extends RequestsGraph with Removable

case class HttpResponseBody(bodyDescriptor: BodyDescriptor)

case class RequestsState(
                          pathComponents: Map[PathComponentId, PathComponent],
                          requests: Map[RequestId, HttpRequest],
                          requestParameters: Map[RequestParameterId, HttpRequestParameter],
                          responses: Map[ResponseId, HttpResponse],
                          parentPath: Map[PathComponentId, PathComponentId]
                        ) {

  ////////////////////////////////////////////////////////////////////////////////

  def withPathComponent(pathId: PathComponentId, parentPathId: PathComponentId, name: String) = {
    this.copy(
      pathComponents = pathComponents + (pathId -> PathComponent(pathId, BasicPathComponentDescriptor(parentPathId, name), isRemoved = false)),
      parentPath = parentPath + (pathId -> parentPathId),
    )
  }

  def withPathComponentNamed(pathId: PathComponentId, name: String) = {
    parentPath.get(pathId) match {
      case Some(parentPathId) => {
        withPathComponent(pathId, parentPathId, name)
      }
    }
  }

  def withoutPathComponent(pathId: PathComponentId) = {
    pathComponents.get(pathId) match {
      case Some(p) => {
        this.copy(
          pathComponents = pathComponents + (pathId -> p.copy(isRemoved = true)),
        )
      }
    }
  }

  ////////////////////////////////////////////////////////////////////////////////

  def withPathParameter(pathId: PathComponentId, parentPathId: PathComponentId, name: String) = {
    this.copy(
      pathComponents = pathComponents + (pathId -> PathComponent(pathId, ParameterizedPathComponentDescriptor(parentPathId, name, UnsetRequestParameterShapeDescriptor()), isRemoved = false)),
      parentPath = parentPath + (pathId -> parentPathId),
    )
  }

  def withPathParameterShape(pathId: PathComponentId, parameterShapeDescriptor: ShapedRequestParameterShapeDescriptor) = {
    pathComponents.get(pathId) match {
      case Some(p) => {
        this.copy(
          pathComponents = pathComponents + (pathId -> p.copy(descriptor = ParameterizedPathComponentDescriptor(p.descriptor.parentPathId, p.descriptor.name, parameterShapeDescriptor)))
        )
      }
    }
  }

  def withoutPathParameter(pathId: PathComponentId) = {
    pathComponents.get(pathId) match {
      case Some(p) => {
        this.copy(
          pathComponents = pathComponents + (pathId -> p.copy(isRemoved = true)),
        )
      }
    }
  }

  ////////////////////////////////////////////////////////////////////////////////

  def withRequest(requestId: RequestId, pathId: PathComponentId, httpMethod: String) = {
    this.copy(
      requests = requests + (requestId -> HttpRequest(requestId, RequestDescriptor(pathId, httpMethod, UnsetBodyDescriptor()), isRemoved = false)),
    )
  }

  def withoutRequest(requestId: RequestId) = {
    requests.get(requestId) match {
      case Some(r) => {
        this.copy(
          requests = requests + (requestId -> r.copy(isRemoved = true))
        )
      }
    }
  }

  def withRequestBody(requestId: RequestId, bodyDescriptor: ShapedBodyDescriptor) = {
    requests.get(requestId) match {
      case Some(r) => {
        this.copy(
          requests = requests + (requestId -> r.copy(requestDescriptor = r.requestDescriptor.copy(bodyDescriptor = bodyDescriptor)))
        )
      }
    }
  }

  ////////////////////////////////////////////////////////////////////////////////

  def withResponse(responseId: ResponseId, requestId: RequestId, httpStatusCode: Int) = {
    this.copy(
      responses = responses + (responseId -> HttpResponse(responseId, ResponseDescriptor(requestId, httpStatusCode, UnsetBodyDescriptor()), isRemoved = false)),
    )
  }

  def withResponseStatusCode(responseId: ResponseId, httpStatusCode: Int) = {
    responses.get(responseId) match {
      case Some(r) => {
        this.copy(
          responses = responses + (responseId -> r.copy(responseDescriptor = r.responseDescriptor.copy(httpStatusCode = httpStatusCode)))
        )
      }
    }
  }

  def withResponseBody(responseId: ResponseId, bodyDescriptor: ShapedBodyDescriptor) = {
    responses.get(responseId) match {
      case Some(r) => {
        this.copy(
          responses = responses + (responseId -> r.copy(responseDescriptor = r.responseDescriptor.copy(bodyDescriptor = bodyDescriptor)))
        )
      }
    }
  }

  ////////////////////////////////////////////////////////////////////////////////

  def withRequestParameter(parameterId: RequestParameterId, requestId: PathComponentId, parameterLocation: String, name: String) = {
    this.copy(
      requestParameters = requestParameters + (parameterId -> HttpRequestParameter(parameterId, RequestParameterDescriptor(requestId, parameterLocation, name, UnsetRequestParameterShapeDescriptor()), isRemoved = false)),
    )
  }

  def withRequestParameterShape(parameterId: RequestParameterId, parameterDescriptor: ShapedRequestParameterShapeDescriptor) = {
    requestParameters.get(parameterId) match {
      case Some(p) => {
        this.copy(
          requestParameters = requestParameters + (parameterId -> p.copy(requestParameterDescriptor = p.requestParameterDescriptor.copy(shapeDescriptor = parameterDescriptor)))
        )
      }
    }
  }

  def withoutRequestParameter(parameterId: RequestParameterId) = {
    requestParameters.get(parameterId) match {
      case Some(p) => {
        this.copy(
          requestParameters = requestParameters + (parameterId -> p.copy(isRemoved = true))
        )
      }
    }
  }

}
