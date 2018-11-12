package com.opticdev.core.utils

import play.api.libs.json.Json
import GetKeyFromJsValue._
import org.scalatest.FunSpec

class GetKeyFromJsValueSpec extends FunSpec {

  val example = Json.parse(
    """
      |{ "hello": {"world": 15, "me": {"time": true}} }
    """.stripMargin)

  it("can walk valid properties") {
    assert(example.walk("hello").get.toString() === """{"world":15,"me":{"time":true}}""")
  }

  it("can walk valid nested properties") {
    assert(example.walk("hello", "me", "time").get.toString() === """true""")
  }

  it("return none if invalid path") {
    assert(example.walk("", "AAAe", "time").isEmpty)
  }

  it("return root if empty") {
    assert(example.walk().get == example)
  }

}
