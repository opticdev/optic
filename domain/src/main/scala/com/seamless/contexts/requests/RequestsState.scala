package com.seamless.contexts.requests

import com.seamless.contexts.requests.Commands._

import scala.scalajs.js.annotation.{JSExport, JSExportAll}


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

case class RequestParameterDescriptor(requestId: RequestId, location: String, name: String, shapeDescriptor: RequestParameterShapeDescriptor)

case class HttpRequestParameter(parameterId: RequestParameterId, requestParameterDescriptor: RequestParameterDescriptor, isRemoved: Boolean) extends RequestsGraph with Removable

case class RequestDescriptor(pathComponentId: PathComponentId, httpMethod: String, bodyDescriptor: BodyDescriptor)

case class HttpRequest(requestId: RequestId, requestDescriptor: RequestDescriptor, isRemoved: Boolean) extends RequestsGraph with Removable

case class ResponseDescriptor(requestId: RequestId, httpStatusCode: Int, bodyDescriptor: BodyDescriptor)

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
    this.copy(
      responses = responses + (responseId -> HttpResponse(responseId, ResponseDescriptor(requestId, httpStatusCode, UnsetBodyDescriptor()), isRemoved = false)),
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

  def withResponseBody(responseId: ResponseId, bodyDescriptor: ShapedBodyDescriptor) = {
    val r = responses(responseId)
    this.copy(
      responses = responses + (responseId -> r.copy(responseDescriptor = r.responseDescriptor.copy(bodyDescriptor = bodyDescriptor)))
    )

  }

  ////////////////////////////////////////////////////////////////////////////////

  def withRequestParameter(parameterId: RequestParameterId, requestId: PathComponentId, parameterLocation: String, name: String) = {
    this.copy(
      requestParameters = requestParameters + (parameterId -> HttpRequestParameter(parameterId, RequestParameterDescriptor(requestId, parameterLocation, name, UnsetRequestParameterShapeDescriptor()), isRemoved = false)),
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
