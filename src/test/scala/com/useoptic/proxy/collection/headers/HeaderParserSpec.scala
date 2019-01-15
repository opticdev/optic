package com.useoptic.proxy.collection.headers

import org.scalatest.FunSpec

class HeaderParserSpec extends FunSpec {

  it("removes standard headers") {
    val result = HeaderParser.cleanHeaders(Map("Date" -> "Example", "Accept" -> "Example", "Authentication" -> "Bearer token"))
    assert(result.keys.toSet == Set("Authentication"))
  }

}
