package com.opticdev.arrow.changes.evaluation

import org.scalatest.FunSpec

class ClipboardBufferSpec extends FunSpec {
  describe("clipboard buffer") {

    def fixture = new ClipboardBuffer

    it("contents can be appended") {
      val f = fixture
      f.append("Abc")
      assert(f.contents == "Abc")

      f.append("def")

      assert(f.contents == "Abc\n\ndef")
    }

  }
}
