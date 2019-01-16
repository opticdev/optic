package com.useoptic.proxy.collection.query

import java.net.URL

import org.scalatest.FunSpec

class QueryParserSpec extends FunSpec {

  it("can parse a simple query with strings") {
    val result = QueryParser.parseQuery("http://test.com/?string=String&bool=true&num=1343")

    val f = result(0)
    val s = result(1)
    val t = result(2)

    assert(f.name == "string" && f.schemaType == "string")
    assert(s.name == "bool" && s.schemaType == "boolean")
    assert(t.name == "num" && t.schemaType == "number")
  }

  it("handles array parameters of same type") {
    val result = QueryParser.parseQuery("http://test.com/?fruits=Apple&fruits=Pears")
    assert(result.size == 1)
    assert(result.head.name == "fruits" && result.head.schemaType == "array")
    assert(result.head.schema.toString() == """{"$schema":"http://json-schema.org/draft-04/schema#","type":"array","items":{"type":"string"}}""")
  }

  it("handles array parameters of mixed type") {
    val result = QueryParser.parseQuery("http://test.com/?fruits=true&fruits=Pears")
    assert(result.size == 1)
    assert(result.head.name == "fruits" && result.head.schemaType == "array")
    assert(result.head.schema.toString() == """{"$schema":"http://json-schema.org/draft-04/schema#","type":"array","items":{"oneOf":[{"type":"boolean"},{"type":"string"}]}}""")
  }

  describe("merging from different observations") {
    val observation1 = QueryParser.parseQuery("http://test.com/?limit=200&filter=admins&filter=makesAbove10k")
    val observation2 = QueryParser.parseQuery("http://test.com/?limit=false&sortBy=dateHired&filter=true")

    val merged = QueryParser.mergeQueryParameters(observation1, observation2)

    val limit = merged(0)
    val filter = merged(1)
    val sortBy = merged(2)

    it("determines required set") {
      assert(limit.name == "limit" && limit.required)
      assert(filter.name == "filter" && filter.required)
      assert(sortBy.name == "sortBy" && !sortBy.required)
    }

    it("merges schemas to oneOf if multiple types observed") {
      assert(limit.schema.toString() == """{"$schema":"http://json-schema.org/draft-04/schema#","oneOf":[{"type":"number"},{"type":"boolean"}]}""")
    }

    it("merges array schema item types. folds in flat fields w/ same key") {
      assert(filter.schema.toString() == """{"$schema":"http://json-schema.org/draft-04/schema#","type":"array","items":{"oneOf":[{"type":"string"},{"type":"boolean"}]}}""")
    }



  }

}
