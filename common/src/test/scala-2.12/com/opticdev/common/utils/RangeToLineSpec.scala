package com.opticdev.common.utils

import org.scalatest.FunSpec
import RangeToLine._

class RangeToLineSpec extends FunSpec {
val testBody =
  """
    |
    |
    |Hello World
    |
    |I am Optic
    |
    |
    |
  """.stripMargin

  it("gets range from chars on same line") {
    val helloWorldRange = Range(testBody.indexOf("H"), testBody.indexOf("d"))
    assert(helloWorldRange.toLineRange(testBody) == Range(3,3))
  }

  it("handles new lines in range properly ") {
    val helloWorldRange = Range(testBody.indexOf("H"), testBody.indexOf("d") + 1 /* to make it the newline */)
    assert(helloWorldRange.toLineRange(testBody) == Range(3,4))
  }

  it("handles multi line range ") {
    val helloWorldRange = Range(testBody.indexOf("H"), testBody.indexOf("c"))
    assert(helloWorldRange.toLineRange(testBody) == Range(3,5))
  }

}
