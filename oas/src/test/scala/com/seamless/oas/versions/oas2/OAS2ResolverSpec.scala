package com.seamless.oas.versions.oas2
import com.seamless.oas
import com.seamless.oas.JsonSchemaType.{Ref, SingleType}
import com.seamless.oas.QueryImplicits._
import com.seamless.oas.ResolverTestFixture
import com.seamless.oas.Schemas.Definition
import com.seamless.oas.Schemas.PathParameter

class OAS2ResolverSpec extends ResolverTestFixture("2") {

  val mattermostResolver = resolverFor(mattermost)

  it("resolves all paths") {
    val paths = mattermostResolver.paths
    assert(paths.size == 191)
  }

  it("resolves all operations") {
    assert(mattermostResolver.paths.~#("/jobs/{job_id}").operations.methodSet == Set("get"))
    assert(mattermostResolver.paths.~#("/hooks/incoming").operations.methodSet == Set("get", "post"))

    //will never find an operation that isn't allowed (parameters)
    assert(mattermostResolver.paths.flatMap(_.operations).methodSet.forall(i => oas.supportedOperations.contains(i)))
  }

  it("resolves all path parameters") {
    val params = mattermostResolver.paths.map { case i => (i.uri, i.pathParameters) }
      .toMap

    assert(params("/hooks/incoming").isEmpty)
    assert(params("/users/{user_id}/teams/{team_id}/channels/members") ==
      Vector(PathParameter("user_id",0), PathParameter("team_id",1)))
    assert(params("/channels/{channel_id}/members/{user_id}/schemeRoles")  ==
      Vector(PathParameter("channel_id",0), PathParameter("user_id",1)))
  }

  it("resolves all definitions") {
    val definitions = mattermostResolver.definitions
    assert(definitions.size == 58)
  }


  describe("json schema") {
    lazy val namedDefinitions = mattermostResolver.definitions
    lazy val roleDefinition = namedDefinitions.~#("Role")


    it("can resolve fields for a definition") {
      assert(roleDefinition.properties.map(_.key).toSet ==
        Set("name", "description", "display_name", "permissions", "scheme_managed", "id"))
    }

    it("returns an empty array if a definition does not support fields") {
      assert(roleDefinition.properties.~#("display_name").properties.isEmpty)
    }

    it("can get the type of a field") {
      assert(roleDefinition.properties.~#("scheme_managed").`type` == SingleType("boolean"))
    }

    it("can handle a ref field") {
      val refField = namedDefinitions.~#("TeamMap").properties.~#("team_id")
      assert(refField.`type` == Ref("#/definitions/Team"))
    }

  }

  describe("responses") {

    lazy val getJobsById = mattermostResolver.paths.~#("/jobs/{job_id}").operations.~#("get")

    it("gets all status codes as ints") {
      val responses = getJobsById.responses
      assert(responses.map(_.status).toSet == Set(200, 400, 401, 403, 404))
    }

    it("can collect all responses") {
      val sharedResponses = mattermostResolver.sharedResponses
      assert(sharedResponses.forall(_.schema.isDefined))
      assert(sharedResponses.size == 7)
    }

    it("can resolve shared response refs using inline definitions") {
      val responses = getJobsById.responses
      assert(responses.forall(s => s.schema.isDefined && s.schema.get.isInstanceOf[Definition]))
    }

  }

  describe("requests") {

    it("can get query parameters for request") {
      val queryParams = mattermostResolver.paths.~#("/emoji").operations.~#("get").queryParameters

      assert(queryParams.map(_.name).toSet == Set("page", "per_page", "sort"))
      println(queryParams)
    }

    it("can get the response body") {
      lazy val postUsers = mattermostResolver.paths.~#("/users").operations.~#("post")
      val requestBody = postUsers.requestBody

      assert(requestBody.isDefined)
      assert(requestBody.get.schema.isDefined)
      assert(requestBody.get.contentType.isDefined)
    }

  }

}
