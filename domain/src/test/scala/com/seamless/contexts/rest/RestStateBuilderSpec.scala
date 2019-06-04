package com.seamless.contexts.rest

import com.seamless.contexts.rest.Commands.{AddContentType, AddRequestBody, AddResponse, CreateEndpoint, RemoveContentType, RemoveRequestBody, RestCommand, SetMethod, SetPath}
import com.seamless.contexts.rest.HttpMethods.{GET, POST}
import org.scalatest.FunSpec

class RestStateBuilderSpec extends FunSpec {

  def fixture(addTestEndpoint: Boolean = false) = new {
    val service = new RestService
    def handle(command: RestCommand) = service.handleCommand("test-api", command)
    def currentState = service.currentState("test-api")

    def newId = RestServiceHelper.newId()

    val testEndpointId = RestServiceHelper.newEndpointId()
    if (addTestEndpoint) {
      handle(CreateEndpoint(testEndpointId, POST, "/test-entity"))
    }
  }

  it("can add an endpoint") {
    val f = fixture(); import f._;
    val endpointId = RestServiceHelper.newEndpointId()
    handle(CreateEndpoint(endpointId, GET, "/users/:userId"))

    assert(currentState.endpoints.values.size == 1)
    assert(currentState.endpoints.values.head.path == "/users/:userId")
  }

  it("can change method of an endpoint") {
    val f = fixture(); import f._;
    val endpointId = RestServiceHelper.newEndpointId()
    handle(CreateEndpoint(endpointId, GET, "/users"))
    handle(SetMethod(POST, endpointId))

    assert(currentState.endpoints.values.head.method == POST)
  }

  it("can change path of an endpoint") {
    val f = fixture(); import f._;
    val newPath = "/users/:userId/profile"
    val endpointId = RestServiceHelper.newEndpointId()
    handle(CreateEndpoint(endpointId, GET, "/users"))
    handle(SetPath(newPath, endpointId))

    assert(currentState.endpoints.values.head.path == newPath)
  }

  it("can add a response to an endpoint") {
    val f = fixture(true); import f._;
    handle(AddResponse(newId, 200, testEndpointId))

    assert(currentState.endpoints(testEndpointId).responses.size == 1)
  }

  it("can add a body to a response") {
    val f = fixture(true); import f._;
    val responseId = newId
    handle(AddResponse(responseId, 200, testEndpointId))
    handle(AddContentType(newId, Some("root_shape"), ContentTypes.`application/json`, responseId, testEndpointId))

    val response = currentState.responses(responseId)
    assert(response.bodies.size == 1)
    val body = currentState.bodies(response.bodies.head)
    assert(body.contentType == ContentTypes.`application/json`)
    assert(body.shape.contains("root_shape"))
  }

  it("can remove a body from a response") {
    val f = fixture(true); import f._;
    val responseId = newId
    handle(AddResponse(responseId, 200, testEndpointId))
    val bodyId = newId
    handle(AddContentType(bodyId, Some("root_shape"), ContentTypes.`application/json`, responseId, testEndpointId))

    val response = currentState.responses(responseId)
    assert(response.bodies.size == 1)

    handle(RemoveContentType(bodyId, responseId, testEndpointId))

    assert(currentState.responses(responseId).bodies.isEmpty)
  }

  it("can add a request body to an endpoint") {
    val f = fixture(true); import f._;
    val requestBodyId = newId
    handle(AddRequestBody(requestBodyId, Some("root_shape"), ContentTypes.`application/json`, testEndpointId))
    assert(currentState.endpoints(testEndpointId).requestBodies.size == 1)

    assert(currentState.bodies(requestBodyId).shape.isDefined)
    assert(currentState.bodies(requestBodyId).contentType == ContentTypes.`application/json`)
  }

  it("can remove a request body from an endpoint") {
    val f = fixture(true); import f._;
    val requestBodyId = newId
    handle(AddRequestBody(requestBodyId, Some("root_shape"), ContentTypes.`application/json`, testEndpointId))
    assert(currentState.endpoints(testEndpointId).requestBodies.size == 1)

    handle(RemoveRequestBody(requestBodyId, testEndpointId))
    assert(currentState.endpoints(testEndpointId).requestBodies.isEmpty)
  }

}
