package com.useoptic.common.spec_types.diff

import com.useoptic.common.spec_types.{Endpoint, Parameter, RequestBody, Response}
import org.scalatest.FunSpec
import play.api.libs.json.Json

class DiffersSpec extends FunSpec {
  import Differs._
  implicit val endpointId = "test"

  val string = Json.obj("type" -> "string")

  val number = Json.obj("type" -> "number")
  val boolean = Json.obj("type" -> "boolean")
  val headerA = Parameter("header", "headerA", true, string)
  val headerB = Parameter("header", "headerB", false, string)
  val queryA = Parameter("query", "queryA", false, string)
  val queryABool = Parameter("query", "queryA", false, boolean)


  describe("parameters") {

    it("will not find any changes for two empty sets of parameters") {
      assert(diffParameters(Vector(), Vector()).isEmpty)
    }

    it("it diffs each type independently even if named the same") {
      val diff = diffParameters(
        Vector(Parameter("header", "a", true, string), Parameter("query", "a", false, string)),
        Vector(Parameter("query", "a", true, string))
      )
      assert(diff.size == 2)
      assert(diff == Set(RemovedParameter("header", "a", endpointId), UpdatedParameterRequire("query", "a", true, endpointId)))
    }

    it("can handle schema changes") {
      val diff = diffParameters(
        Vector(queryA),
        Vector(queryABool)
      )

      assert(diff.head == UpdatedParameterSchema("query", "queryA", boolean, endpointId))
    }


  }

  describe("diff body") {
    val objectBodySchema = Some(Json.obj("type" -> "string"))
    val arraySchema = Some(Json.obj("type" -> "array"))

    val noBody: Option[RequestBody] = None
    val objectBody = Some(RequestBody("application/json", objectBodySchema))
    val otherBody = Some(RequestBody("application/json", arraySchema))
    val xmlobjectBody = Some(RequestBody("application/xml", objectBodySchema))

    it("added body") {
      val result = diffBody(noBody, objectBody)
      assert(result.size == 1)
      assert(result.head.isInstanceOf[AddedRequestBody])
    }

    it("removed body") {
      val result = diffBody(objectBody, noBody)
      assert(result.size == 1)
      assert(result.head.isInstanceOf[RemovedRequestBody])
    }

    it("updated content type") {
      val result = diffBody(objectBody, xmlobjectBody)
      assert(result.size == 1)
      assert(result.head.isInstanceOf[UpdatedRequestBodyContentType])
    }

    it("updated request schema") {
      val result = diffBody(objectBody, otherBody)
      assert(result.size == 1)
      assert(result.head.isInstanceOf[UpdatedRequestBodySchema])
    }

  }

  describe("endpoints") {
    val endpoint1 = Endpoint("post", "/mypath1", Vector(), Vector(headerA, headerB), None)
    val endpoint2 = Endpoint("post", "/mypath2", Vector(), Vector(), None)
    val endpoint3 = Endpoint("post", "/mypath3", Vector(), Vector(), None)

    val endpoint1a = Endpoint("post", "/mypath1", Vector(), Vector(headerA, queryA), None)
    val endpoint2a = Endpoint("post", "/mypath2", Vector(), Vector(queryA), None)
    val endpoint4a = Endpoint("post", "/mypath4", Vector(), Vector(), None, Vector(
      Response(200 , Vector(), Some("application/json"), Some(Json.obj("type" -> "object")))
    ))

    it("returns empty if no changes") {
      assert(diffEndpoints(
        Vector(endpoint1, endpoint2),
        Vector(endpoint1, endpoint2)
      ).isEmpty)
    }

    it("finds added endpoints, but does not enumerate their properties") {
      val result = diffEndpoints(
        Vector(endpoint1, endpoint2),
        Vector(endpoint1, endpoint2, endpoint4a)
      )
      assert(result.size == 1)
      assert(result.head.isInstanceOf[AddedEndpoint])
    }

    it("finds removed endpoints, but does not enumerate their properties") {
      val result = diffEndpoints(
        Vector(endpoint1, endpoint2),
        Vector(endpoint1)
      )
      assert(result.size == 1)
      assert(result.head.isInstanceOf[RemovedEndpoint])
    }

    it("finds updated endpoints") {
      val result = diffEndpoints(
        Vector(endpoint2),
        Vector(endpoint2a)
      )
      assert(result.size == 1)
      assert(result.head.isInstanceOf[AddedParameter])
    }

  }

}
