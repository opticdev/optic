package com.useoptic.common.spec_types

import org.scalatest.FunSpec

class EndpointSpec extends FunSpec {

  describe("URL Parameters") {
    def testUrl(url: String) = Endpoint.pathParameters(url)

    it("can extract a basic url parameter") {
      val params = testUrl("/basic/:world")
      assert(params.size == 1)
      assert(params.head.name == "world")
    }

    it("can extract multiple url parameters") {
      val params = testUrl("/basic/:projects/:world/:place")
      assert(params.size == 3)
      assert(params.map(_.name) == Vector("projects", "world", "place"))
    }

    it("can extract of parameters that are not separated by forward slashes") {
      val params = testUrl("/basic/:project-:branch/:version")
      assert(params.size == 3)
      assert(params.map(_.name) == Vector("project", "branch", "version"))

    }

  }

}
