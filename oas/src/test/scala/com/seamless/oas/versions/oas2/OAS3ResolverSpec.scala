package com.seamless.oas.versions.oas2

import com.seamless.oas
import com.seamless.oas.JsonSchemaType.{Ref, SingleType}
import com.seamless.oas.QueryImplicits._
import com.seamless.oas.ResolverTestFixture
import com.seamless.oas.Schemas.{Definition, PathParameter}

class OAS3ResolverSpec extends ResolverTestFixture("3") {

  val bbcResolver = resolverFor(bbc)
  val boxResolver = resolverFor(box)

  it("resolves all paths") {
    val paths = bbcResolver.paths
    assert(paths.size == 25)
  }

  it("resolves all operations") {
    assert(bbcResolver.paths.~#("/v1/episodes/{pid}").operations.methodSet == Set("get"))
    assert(bbcResolver.paths.~#("/schedules").operations.methodSet == Set("get"))

    //will never find an operation that isn't allowed (parameters)
    assert(bbcResolver.paths.flatMap(_.operations).methodSet.forall(i => oas.supportedOperations.contains(i)))
  }

  it("resolves all path parameters") {
    val params = bbcResolver.paths.map { case i => (i.uri, i.pathParameters) }
      .toMap

    //shared
    assert(params("/v1/brands/{pid}").size == 1)
    //local
    assert(params("/v1/brands/{pid}/franchises/").size == 1)
  }

  it("resolves all definitions") {
    val definitions = bbcResolver.definitions
    assert(definitions.size == 219)
  }


  describe("json schema") {
    lazy val namedDefinitions = bbcResolver.definitions
    lazy val contributorNameDefinition = namedDefinitions.~#("contributor_name")

    it("can resolve fields for a definition") {
      assert(contributorNameDefinition.properties.map(_.key).toSet ==
        Set("name"))
    }

    it("returns an empty array if a definition does not support fields") {
      assert(contributorNameDefinition.properties.~#("name").properties.~#("family").properties.isEmpty)
    }

    it("can get the type of a field") {
      assert(contributorNameDefinition.properties.~#("name").properties.~#("family").`type` == SingleType("string"))
    }

    it("can handle a ref field") {
      val refField = namedDefinitions.~#("episode").properties.~#("advertising_allowed")
      assert(refField.`type` == Ref("#/components/schemas/advertising_allowed"))
    }

    it("can lookup a ref") {
      val result = bbcResolver.resolveDefinition("#/components/schemas/advertising_allowed")
      assert(result.isDefined)
    }

  }

  describe("responses") {

    lazy val putCollaboration = boxResolver.paths.~#("/collaborations/{collaboration_id}").operations.~#("put")

    it("gets all status codes as ints") {
      val responses = putCollaboration.responses
      assert(responses.map(_.status).toSet == Set(200, 204))
    }

//    it("can collect all responses") {
//      val sharedResponses = bbcResolver.sharedResponses
//      assert(sharedResponses.forall(_.schema.isDefined))
//      assert(sharedResponses.size == 7)
//    }
//
//    it("can resolve shared response refs using inline definitions") {
//      val responses = getBroadcasts.responses
//      assert(responses.forall(s => s.schema.isDefined && s.schema.get.isInstanceOf[Definition]))
//    }

  }
//
  describe("requests") {

    it("can get query parameters for request") {
      val queryParams = bbcResolver.paths.~#("/groups").operations.~#("get").queryParameters
      assert(queryParams.map(_.name).toSet == Set(
      "partner_pid",
      "group_type",
      "partner_id",
      "page",
      "page_size",
      "q",
      "pid",
      "member",
      "for_programme",
      "sort_direction",
      "embargoed",
      "sort",
      "for_descendants_of",
      "group",
      "mixin"))
    }

    it("can get the response body") {
      lazy val postUsers = boxResolver.paths.~#("/collaboration_whitelist_entries").operations.~#("post")
      val requestBody = postUsers.requestBody

      assert(requestBody.isDefined)
      assert(requestBody.get.schema.isDefined)
      assert(requestBody.get.contentType.isDefined)
    }

  }

}
