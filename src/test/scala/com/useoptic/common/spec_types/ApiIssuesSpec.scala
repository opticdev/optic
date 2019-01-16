package com.useoptic.common.spec_types

import org.scalatest.FunSpec
import play.api.libs.json.JsObject

class ApiIssuesSpec extends FunSpec {

  val exampleResponse = Response(200, Vector(), Some("application/json"), Some(JsObject.empty))

  it("error when no responses") {
    val endpoint = Endpoint("post", "/url/:me", Vector(), None, Vector())
    assert(endpoint.issues.size == 1)
    assert(endpoint.hasIssues)
    assert(endpoint.issues.head.isInstanceOf[NoResponses])
  }

  it("warning when no body schema") {
    val endpoint = Endpoint("post", "/url/:me", Vector(), Some(RequestBody("application/json", Some(JsObject.empty))), Vector(exampleResponse))
    assert(endpoint.issues.size == 1)
    assert(endpoint.hasIssues)
    assert(endpoint.issues.head.isInstanceOf[RequestBodyWithoutSchema])
  }
//
//  it("warning when body schema and no content type") {
//    val endpoint = Endpoint("post", "/url/:me", Vector(), Some(RequestBody(None, Some(JsObject.empty))), Vector(exampleResponse))
//    assert(endpoint.issues.size == 1)
//    assert(endpoint.hasIssues)
//    assert(endpoint.issues.head.isInstanceOf[RequestBodyWithoutContentType])
//  }

  it("warning when no response body schema") {
    val endpoint = Endpoint("post", "/url/:me", Vector(), None, Vector(Response(200, Vector(), Some("application/json"), None)))
    assert(endpoint.issues.size == 1)
    assert(endpoint.hasIssues)
    assert(endpoint.issues.head.isInstanceOf[ResponseBodyWithoutSchema])
  }

  it("warning when no response body and ") {
    val endpoint = Endpoint("post", "/url/:me", Vector(), None, Vector(Response(200, Vector(), None, Some(JsObject.empty))))
    assert(endpoint.issues.size == 1)
    assert(endpoint.hasIssues)
    assert(endpoint.issues.head.isInstanceOf[ResponseBodyWithoutContentType])
  }

}
