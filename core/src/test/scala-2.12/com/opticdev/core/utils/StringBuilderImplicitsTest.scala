package com.opticdev.core.utils

import org.scalatest.FunSpec

class StringBuilderImplicitsTest extends FunSpec {
  describe("String builder implicits") {
    import com.opticdev.core.utils.StringBuilderImplicits._

    it("can update with contents of same length") {
      val exampleBuilder: StringBuilder = new StringBuilder("Hello World")
      exampleBuilder.updateRange(Range(0,1), "A")
      assert(exampleBuilder.toString() == "Aello World")
    }

    it("can update with contents of a longer length") {
      val exampleBuilder: StringBuilder = new StringBuilder("Hello World")
      exampleBuilder.updateRange(Range(0,5), "Goodbye")
      assert(exampleBuilder.toString() == "Goodbye World")
    }

    it("can update with contents of a longer length starting after 0") {
      val exampleBuilder: StringBuilder = new StringBuilder(": Hello World")
      exampleBuilder.updateRange(Range(2,7), "Goodbye")
      assert(exampleBuilder.toString() == ": Goodbye World")
    }

    it("can update with contents of a shorter length") {
      val exampleBuilder: StringBuilder = new StringBuilder("Hello World")
      exampleBuilder.updateRange(Range(0,5), "THE")
      assert(exampleBuilder.toString() == "THE World")
    }

    it("fails on invalid range") {
      val exampleBuilder: StringBuilder = new StringBuilder("Hello World")
      assertThrows[Error] {
        exampleBuilder.updateRange(Range(12, 2), "THE")
      }

      assertThrows[Error] {
        exampleBuilder.updateRange(Range(-5, -2), "THE")
      }

      assertThrows[Error] {
        exampleBuilder.updateRange(Range(33, 35), "THE")
      }
    }

  }

}
