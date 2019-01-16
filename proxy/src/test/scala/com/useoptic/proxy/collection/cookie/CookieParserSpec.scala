package com.useoptic.proxy.collection.cookie

import akka.http.impl.model.parser.HeaderParser
import akka.http.scaladsl.model.HttpHeader
import com.useoptic.common.spec_types.Parameter
import com.useoptic.proxy.collection.jsonschema.JsonSchemaBuilderUtil.basicSchema
import org.scalatest.FunSpec

class CookieParserSpec extends FunSpec {

  it("can parse cookies out of headers") {
    val cookies = CookieParser.parseHeadersIntoCookies(Vector(
      "Not-Proper-header" -> "cookie=valid",
      "Set-Cookie" -> "iam=correct",
      "Set-Cookie" -> "iamalso=correct",
      "Cookie" -> "iamc=also_correct",
      "Cookie" -> "as_am=I",
      "Cookie" -> "I am not a cookie"
    ))

    assert(cookies.map(_.name) == Vector("iam", "iamalso", "iamc", "as_am"))
  }

  it("can merge observed cookies") {
    val observation1 = Vector(
      Parameter("cookie", "token", true, basicSchema("string")),
      Parameter("cookie", "userId", true, basicSchema("string")),
      Parameter("cookie", "optional", true, basicSchema("string"))
    )
    val observation2 = Vector(
      Parameter("cookie", "token", true, basicSchema("string")),
      Parameter("cookie", "userId", true, basicSchema("string"))
    )

    val finalCookies = CookieParser.mergeCookies(observation1, observation2)

    assert(finalCookies.find(_.name == "token").get.required)
    assert(finalCookies.find(_.name == "userId").get.required)
    assert(!finalCookies.find(_.name == "optional").get.required)

  }

}
