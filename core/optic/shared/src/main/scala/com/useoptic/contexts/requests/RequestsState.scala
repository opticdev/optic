package com.useoptic.contexts.requests

import com.useoptic.contexts.requests.Commands._

import scala.scalajs.js.annotation.JSExport


sealed trait RequestsGraph

sealed trait Removable {
  val isRemoved: Boolean
}

case class PathComponent(pathId: PathComponentId, descriptor: PathComponentDescriptor, isRemoved: Boolean) extends RequestsGraph with Removable {
  def withName(name: String) = {
    this.copy(
      descriptor = descriptor match {
        case d: BasicPathComponentDescriptor => d.copy(name = name)
        case d: ParameterizedPathComponentDescriptor => d.copy(name = name)
      }
    )
  }
}

case class RequestParameterDescriptor(pathId: RequestId, httpMethod: String, location: String, name: String, shapeDescriptor: RequestParameterShapeDescriptor)

case class HttpRequestParameter(parameterId: RequestParameterId, requestParameterDescriptor: RequestParameterDescriptor, isRemoved: Boolean) extends RequestsGraph with Removable

case class RequestDescriptor(pathComponentId: PathComponentId, httpMethod: String, bodyDescriptor: BodyDescriptor) {
  def withContentType(httpContentType: String): RequestDescriptor = {
    this.copy(
      bodyDescriptor = this.bodyDescriptor match {
        case UnsetBodyDescriptor() => UnsetBodyDescriptor() //@TODO: should probably fail in validation?
        case d: ShapedBodyDescriptor => {
          d.copy(httpContentType = httpContentType)
        }
      }
    )
  }
}

case class HttpRequest(requestId: RequestId, requestDescriptor: RequestDescriptor, isRemoved: Boolean) extends RequestsGraph with Removable

case class ResponseDescriptor(pathId: PathComponentId, httpMethod: String, httpStatusCode: Int, bodyDescriptor: BodyDescriptor) {
  def withContentType(httpContentType: String): ResponseDescriptor = {
    this.copy(
      bodyDescriptor = this.bodyDescriptor match {
        case UnsetBodyDescriptor() => UnsetBodyDescriptor() //@TODO: should probably fail in validation?
        case d: ShapedBodyDescriptor => {
          d.copy(httpContentType = httpContentType)
        }
      }
    )
  }
}

case class HttpResponse(responseId: ResponseId, responseDescriptor: ResponseDescriptor, isRemoved: Boolean) extends RequestsGraph with Removable

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
    val p = pathComponents(pathId)
    this.copy(
      pathComponents = pathComponents + (pathId -> p.withName(name))
    )
  }

  def withoutPathComponent(pathId: PathComponentId) = {
    val p = pathComponents(pathId)
    this.copy(
      pathComponents = pathComponents + (pathId -> p.copy(isRemoved = true)),
    )
  }

  ////////////////////////////////////////////////////////////////////////////////

  def withPathParameter(pathId: PathComponentId, parentPathId: PathComponentId, name: String) = {
    this.copy(
      pathComponents = pathComponents + (pathId -> PathComponent(pathId, ParameterizedPathComponentDescriptor(parentPathId, name, UnsetRequestParameterShapeDescriptor()), isRemoved = false)),
      parentPath = parentPath + (pathId -> parentPathId),
    )
  }

  def withPathParameterNamed(pathId: PathComponentId, name: String) = {
    val parentPathId = parentPath(pathId)
    withPathParameter(pathId, parentPathId, name)
  }

  def withPathParameterShape(pathId: PathComponentId, parameterShapeDescriptor: ShapedRequestParameterShapeDescriptor) = {
    val p = pathComponents(pathId)
    this.copy(
      pathComponents = pathComponents + (pathId -> p.copy(descriptor = ParameterizedPathComponentDescriptor(p.descriptor.parentPathId, p.descriptor.name, parameterShapeDescriptor)))
    )
  }

  def withoutPathParameter(pathId: PathComponentId) = {
    val p = pathComponents(pathId)
    this.copy(
      pathComponents = pathComponents + (pathId -> p.copy(isRemoved = true)),
    )
  }

  ////////////////////////////////////////////////////////////////////////////////

  def withRequest(requestId: RequestId, pathId: PathComponentId, httpMethod: String) = {
    this.copy(
      requests = requests + (requestId -> HttpRequest(requestId, RequestDescriptor(pathId, httpMethod, UnsetBodyDescriptor()), isRemoved = false)),
    )
  }

  def withRequestContentType(requestId: RequestId, httpContentType: String) = {
    val r = requests(requestId)
    this.copy(
      requests = requests + (requestId -> r.copy(requestDescriptor = r.requestDescriptor.withContentType(httpContentType)))
    )
  }

  def withoutRequest(requestId: RequestId) = {
    val r = requests(requestId)
    this.copy(
      requests = requests + (requestId -> r.copy(isRemoved = true))
    )
  }

  def withRequestBody(requestId: RequestId, bodyDescriptor: ShapedBodyDescriptor) = {
    val r = requests(requestId)
    this.copy(
      requests = requests + (requestId -> r.copy(requestDescriptor = r.requestDescriptor.copy(bodyDescriptor = bodyDescriptor)))
    )
  }

  ////////////////////////////////////////////////////////////////////////////////

  def withResponse(responseId: ResponseId, requestId: RequestId, httpStatusCode: Int) = {
    val request = requests(requestId)
    this.withResponseByPathAndMethod(responseId, request.requestDescriptor.pathComponentId, request.requestDescriptor.httpMethod, httpStatusCode)
  }

  def withResponseByPathAndMethod(responseId: ResponseId, pathId: PathComponentId, httpMethod: String, httpStatusCode: Int) = {
    this.copy(
      responses = responses + (responseId -> HttpResponse(responseId, ResponseDescriptor(pathId, httpMethod, httpStatusCode, UnsetBodyDescriptor()), isRemoved = false)),
    )
  }

  def withoutResponse(responseId: ResponseId) = {
    val r = responses(responseId)

    this.copy(
      responses = responses + (responseId -> r.copy(isRemoved = true))
    )
  }

  def withResponseStatusCode(responseId: ResponseId, httpStatusCode: Int) = {
    val r = responses(responseId)
    this.copy(
      responses = responses + (responseId -> r.copy(responseDescriptor = r.responseDescriptor.copy(httpStatusCode = httpStatusCode)))
    )
  }

  def withResponseContentType(responseId: ResponseId, httpContentType: String) = {
    val r = responses(responseId)
    this.copy(
      responses = responses + (responseId -> r.copy(responseDescriptor = r.responseDescriptor.withContentType(httpContentType)))
    )
  }

  def withResponseBody(responseId: ResponseId, bodyDescriptor: ShapedBodyDescriptor) = {
    val r = responses(responseId)
    this.copy(
      responses = responses + (responseId -> r.copy(responseDescriptor = r.responseDescriptor.copy(bodyDescriptor = bodyDescriptor)))
    )

  }

  ////////////////////////////////////////////////////////////////////////////////

  def withRequestParameter(parameterId: RequestParameterId, requestId: PathComponentId, parameterLocation: String, name: String) = {
    val request = requests(requestId)
    this.withRequestParameterByPathAndMethod(parameterId, request.requestDescriptor.pathComponentId, request.requestDescriptor.httpMethod, parameterLocation, name)
  }

  def withRequestParameterByPathAndMethod(parameterId: RequestParameterId, pathId: PathComponentId, httpMethod: String, parameterLocation: String, name: String) = {
    this.copy(
      requestParameters = requestParameters + (parameterId -> HttpRequestParameter(parameterId, RequestParameterDescriptor(pathId, httpMethod, parameterLocation, name, UnsetRequestParameterShapeDescriptor()), isRemoved = false)),
    )
  }

  def withRequestParameterShape(parameterId: RequestParameterId, parameterDescriptor: ShapedRequestParameterShapeDescriptor) = {
    val p = requestParameters(parameterId)

    this.copy(
      requestParameters = requestParameters + (parameterId -> p.copy(requestParameterDescriptor = p.requestParameterDescriptor.copy(shapeDescriptor = parameterDescriptor)))
    )
  }

  def withRequestParameterName(parameterId: RequestParameterId, name: String) = {
    val p = requestParameters(parameterId)

    this.copy(
      requestParameters = requestParameters + (parameterId -> p.copy(requestParameterDescriptor = p.requestParameterDescriptor.copy(name = name)))
    )
  }

  def withoutRequestParameter(parameterId: RequestParameterId) = {
    val p = requestParameters(parameterId)
    this.copy(
      requestParameters = requestParameters + (parameterId -> p.copy(isRemoved = true))
    )
  }

  ////////////////////////////////////////////////////////////////////////////////

}
