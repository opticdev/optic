package com.useoptic.proxy.collection

import org.scalatest.FunSpec

class BuildAPISpecSpec extends FunSpec {
  implicit val errorAccumulator = new ErrorAccumulator

  val testConfig = TestData.Interactions.testConfig

  it("can build an endpoint object from an interaction") {
    val result = BuildAPISpec.endPointsFromInteractions(Vector(TestData.Interactions.loginSuccess), testConfig)
    val endpoint = result.head.get

    assert(endpoint.method == "post")
    assert(endpoint.url == "/login")
    assert(endpoint.body.isDefined)
    assert(endpoint.responses.size == 1)

  }

  it("can merge endpoints correctly") {
    val result = BuildAPISpec.endPointsFromInteractions(Vector(
      TestData.Interactions.loginSuccess,
      TestData.Interactions.loginFallbackToCreationSuccess,
      TestData.Interactions.loginFailed,
      TestData.Interactions.loginUserNotFound,
    ), testConfig)

    val merged = BuildAPISpec.mergeEndpoints(result.map(_.get))
    val endpoint = merged.head

    assert(endpoint.method == "post")
    assert(endpoint.url == "/login")
    assert(endpoint.body.get.schema.get.toString() == "{\"$schema\":\"http://json-schema.org/draft-04/schema#\",\"type\":\"object\",\"properties\":{\"username\":{\"type\":\"string\"},\"password\":{\"type\":\"string\"}}}")

    assert(endpoint.responses.map(_.status) == Vector(200, 201, 401, 404))

    assert(endpoint.responses.find(_.status == 200).get.schema.isEmpty)
    assert(endpoint.responses.find(_.status == 201).get.schema.get.toString() == "{\"$schema\":\"http://json-schema.org/draft-04/schema#\",\"type\":\"object\",\"properties\":{\"username\":{\"type\":\"string\"},\"id\":{\"type\":\"string\"},\"email\":{\"type\":\"string\"},\"friends\":{\"type\":\"array\",\"items\":{\"type\":\"string\"}}}}")
    assert(endpoint.responses.find(_.status == 401).get.schema.get.toString() == "{\"$schema\":\"http://json-schema.org/draft-04/schema#\",\"type\":\"string\"}")
    assert(endpoint.responses.find(_.status == 404).get.schema.get.toString() == "{\"$schema\":\"http://json-schema.org/draft-04/schema#\",\"type\":\"string\"}")


  }




}
