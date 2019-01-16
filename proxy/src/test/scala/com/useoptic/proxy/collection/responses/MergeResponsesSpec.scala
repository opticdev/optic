package com.useoptic.proxy.collection.responses

import com.useoptic.common.spec_types.Response
import com.useoptic.proxy.collection.TestData
import com.useoptic.proxy.collection.jsonschema.JsonSchemaBuilderUtil
import org.scalatest.FunSpec

class MergeResponsesSpec extends FunSpec {

  it("can merge a single response") {
    val basic = Response(200, Vector(), None, None)
    val result = MergeResponses.mergeResponses(Vector(basic))
    assert(result.head == basic)
  }

  it("will keep first Content-Type observed for status") {
    val first = Response(200, Vector(), Some("application/json"), Some(JsonSchemaBuilderUtil.basicSchema("number")))
    val second = Response(200, Vector(), Some("text/plain"), Some(JsonSchemaBuilderUtil.basicSchema("string")))
    val result = MergeResponses.mergeResponses(Vector(first, second))

    assert(result.size == 1)
    assert(result.head.status == 200)
    assert(result.head.schema.get.toString == "{\"$schema\":\"http://json-schema.org/draft-04/schema#\",\"type\":\"number\"}")
  }

  it("will merge two of the same status types using oneOf") {
    val first = Response(200, Vector(), Some("application/json"), Some(JsonSchemaBuilderUtil.basicSchema("number")))
    val second = Response(200, Vector(), Some("application/json"), Some(JsonSchemaBuilderUtil.basicSchema("string")))
    val result = MergeResponses.mergeResponses(Vector(first, second))

    assert(result.size == 1)
    assert(result.head.status == 200)
    assert(result.head.schema.get.toString == "{\"$schema\":\"http://json-schema.org/draft-04/schema#\",\"oneOf\":[{\"type\":\"number\"},{\"type\":\"string\"}]}")
  }

  it("will not merge if schemas are the exact same") {
    val first = Response(200, Vector(), Some("application/json"), Some(JsonSchemaBuilderUtil.basicSchema("number")))
    val second = Response(200, Vector(), Some("application/json"), Some(JsonSchemaBuilderUtil.basicSchema("number")))
    val result = MergeResponses.mergeResponses(Vector(first, second))

    assert(result.size == 1)
    assert(result.head.status == 200)
    assert(result.head.schema.get.toString == "{\"$schema\":\"http://json-schema.org/draft-04/schema#\",\"type\":\"number\"}")
  }

}
