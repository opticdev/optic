package com.seamless.contexts.rest

import com.seamless.contexts.data_types.Commands.ShapeId
import com.seamless.contexts.data_types.{DataTypesAggregate, DataTypesServiceHelper, DataTypesState, ShapeDescription, Validators}
import com.seamless.contexts.rest.Commands.{BodyId, EndpointId, ResponseId}
import com.seamless.contexts.rest.HttpMethods.HttpMethod

case class RestState(endpoints: Map[EndpointId, Endpoint] = Map.empty,
                     responses: Map[ResponseId, Response] = Map.empty,
                     bodies: Map[BodyId, Body] = Map.empty,
                     dataTypesState: DataTypesState = DataTypesAggregate.initialState,
                     creationOrder: Vector[String] = Vector.empty) {

  def putEndpoint(id: EndpointId, endpoint: Endpoint): RestState = {
    val created = !creationOrder.contains(id)
    this.copy(endpoints = endpoints + (id -> endpoint), creationOrder = if (created) creationOrder :+ id else creationOrder)
  }

  def putResponse(id: ResponseId, response: Response): RestState = {
    val created = !creationOrder.contains(id)
    this.copy(responses = responses + (id -> response), creationOrder = if (created) creationOrder :+ id else creationOrder)
  }

  def putBody(id: BodyId, body: Body): RestState = {
    val created = !creationOrder.contains(id)
    this.copy(bodies = bodies + (id -> body), creationOrder = if (created) creationOrder :+ id else creationOrder)
  }

  def endpointExists(endpointId: EndpointId) = endpoints.isDefinedAt(endpointId)

  def updateEndpoint(endpointId: EndpointId)(updater: Endpoint => Endpoint) = {
    val updated = updater(endpoints(endpointId))
    putEndpoint(endpointId, updated)
  }

  def update(u: ((RestState) => RestState)*): RestState = {
    u.foldLeft(this) { (c, updater) => updater(c) }
  }

}

case class Body(contentType: ContentType, shape: Option[ShapeId]) {
  if (shape.isDefined) {
    require(contentType.hasSchema, s"${contentType.raw} does not support schemas")
  }
}

case class Response(status: Int, bodies: Vector[String]) {
  def appendBody(id: String): Response = {
    if (!bodies.contains(id)) {
      this.copy(bodies = bodies :+ id)
    } else this
  }

  def removeBody(id: String): Response = {
    this.copy(bodies = bodies.filterNot(i => i == id))
  }

}

case class Endpoint(path: String,
                    method: HttpMethod,
                    requestBodies: Vector[String],
                    responses: Vector[String]) {

  def updateMethod(newMethod: HttpMethod) = {
    if (newMethod.hasRequestBody) {
      this.copy(method = newMethod)
    } else {
      this.copy(method = newMethod, requestBodies = Vector())
    }
  }

  def appendResponse(id: ResponseId): Endpoint = {
    this.copy(responses = responses :+ id)
  }

  def appendRequestBody(id: BodyId): Endpoint = {
    this.copy(requestBodies = requestBodies :+ id)
  }

}

object Endpoint {
  def default(path: String, method: HttpMethod): Endpoint = {
    Endpoint(path, method, Vector(), Vector())
  }
}
