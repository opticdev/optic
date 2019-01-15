package com.useoptic.proxy.collection.headers

import com.useoptic.common.spec_types.Parameter
import org.scalatest.FunSpec
import com.useoptic.proxy.collection.jsonschema.JsonSchemaBuilderUtil.basicSchema

class HeaderParserSpec extends FunSpec {

  it("removes standard headers") {
    val result = HeaderParser.cleanHeaders(Vector("Date" -> "Example", "Accept" -> "Example", "Authentication" -> "Bearer token"))
    assert(result.map(_._1).toSet == Set("Authentication"))
  }

  it("can parse a set of headers") {

    val headers = HeaderParser.parseHeaders(Vector(
      "X-My-Custom" -> "DO-Thing",
      "X-Other-Custom" -> "DO-Thing",
      "Date" -> "Example" //should be ignored
    ))

    assert(headers.size == 2)
    assert(headers.head.name == "X-My-Custom")
    assert(headers.last.name == "X-Other-Custom")
  }

  it("can merge a set of headers") {

    val observation1 = Vector(
      Parameter("header", "X-Required", true, basicSchema("string")),
      Parameter("header", "X-Not-Required", true, basicSchema("string")),
      Parameter("header", "X-Not-Required2", true, basicSchema("string")),
    )

    val observation2 = Vector(
      Parameter("header", "X-Required", true, basicSchema("string")),
      Parameter("header", "X-Not-Required", true, basicSchema("string")),
    )

    val observation3 = Vector(
      Parameter("header", "X-Required", true, basicSchema("string")),
    )

    val finalHeaders = HeaderParser.mergeHeaders(observation1, observation2, observation3)

    assert(finalHeaders.find(_.name == "X-Required").get.required)
    assert(!finalHeaders.find(_.name == "X-Not-Required").get.required)
    assert(!finalHeaders.find(_.name == "X-Not-Required2").get.required)

  }

}
