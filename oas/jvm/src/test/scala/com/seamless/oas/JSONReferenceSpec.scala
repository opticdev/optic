package com.seamless.oas

import org.scalatest.FunSpec
import play.api.libs.json.Json

class JSONReferenceSpec extends FunSpec {

  val simple = Json.parse(
    """
      | {"one": true,
      |  "two": "2",
      |  "sub": {"value": {"one": 1} }
      | }
    """.stripMargin)

  it("can walk to nested key") {
    val result = JSONReference.walk("#/sub/value", simple)
    assert(result.get.toString() == "{\"one\":1}")
  }

  it("can get root key") {
    val result = JSONReference.walk("#/two", simple)
    assert(result.get.toString() == "\"2\"")
  }

  it("None if not valid") {
    assert(JSONReference.walk("#/not-real", simple).isEmpty)
  }

}
