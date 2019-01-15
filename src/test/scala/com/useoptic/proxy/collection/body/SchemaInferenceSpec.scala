package com.useoptic.proxy.collection.body

import com.useoptic.proxy.collection.TestData
import org.scalatest.FunSpec
import play.api.libs.json.{JsString, Json}

class SchemaInferenceSpec extends FunSpec {

  it("can infer a schema from primitive") {
    assert(SchemaInference.infer(JsString("Test")).toString() ==
      """{"$schema":"http://json-schema.org/draft-04/schema#","type":"string"}""")
  }

  it("can infer a schema from object") {
    assert(SchemaInference.infer(Json.obj("username" -> "testuser", "password" -> "testpassword")).toString() ==
      """{"$schema":"http://json-schema.org/draft-04/schema#","type":"object","properties":{"username":{"type":"string"},"password":{"type":"string"}}}""")
  }

}
