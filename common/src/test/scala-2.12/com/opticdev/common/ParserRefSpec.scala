package com.opticdev.common

import org.scalatest.FunSpec

class ParserRefSpec extends FunSpec {
  it("will be @latest by default") {
    assert(ParserRef("Javascript").version == "latest")
  }

  it("can be instantiated from string") {
    assert(ParserRef.fromString("Javascript@latest").get == ParserRef("Javascript", "latest"))
    assert(ParserRef.fromString("Javascript").get == ParserRef("Javascript", "latest"))
    assert(ParserRef.fromString("Javascript@2.1.2").get == ParserRef("Javascript", "2.1.2"))
  }

  it("fails if there's an invalid format") {
    assert(ParserRef.fromString("Javascript@@@latest").isFailure)
  }
}
