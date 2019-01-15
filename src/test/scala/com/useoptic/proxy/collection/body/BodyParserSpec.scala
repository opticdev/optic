package com.useoptic.proxy.collection.body

import com.useoptic.proxy.collection.TestData
import org.scalatest.FunSpec
import play.api.libs.json.Json
import scalaj.http.Base64

class BodyParserSpec extends FunSpec {

  it("can parse valid JSON body") {
    val bodyRaw = TestData.Body.jsonBody(Json.obj("boolProperty" -> true, "numberProp" -> 15))
    val result = BodyParser.parse("application/json", bodyRaw)
    assert(result.isSuccess)
    val body = result.get
    assert(body.contentType == "application/json")
    assert(body.schema.toString() == """{"$schema":"http://json-schema.org/draft-04/schema#","type":"object","properties":{"boolProperty":{"type":"boolean"},"numberProp":{"type":"number"}}}""")
  }

  it("can parse valid text body") {
    val result = BodyParser.parse("text/plain", Base64.encodeString("Hello World"))
    assert(result.isSuccess)
    val body = result.get
    assert(body.contentType == "text/plain")
    assert(body.schema.toString() == """{"$schema":"http://json-schema.org/draft-04/schema#","type":"string"}""")
  }

  describe("exceptions") {
    it("will throw if content is json but body is not valid json") {
      val result = BodyParser.parse("application/json", Base64.encodeString("""{]"""))
      assert(result.isFailure)
      assert(result.failed.get.getMessage == "The body for this request is not valid json")
    }
  }
}
