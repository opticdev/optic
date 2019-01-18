package com.useoptic.common.spec_types.diff

import org.scalatest.FunSpec

class DiffUtilsSpec extends FunSpec {
  it("keys diff properly") {

    val a = Set("a", "b", "c", "d")
    val b = Set("e", "f", "a")

    val diff = DiffUtils.keyDiff(a, b)(i => i)
    assert(diff.added == Set("e", "f"))
    assert(diff.removed == Set("b", "c", "d"))
    assert(diff.same == Set("a"))
  }
}
