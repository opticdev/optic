package com.opticdev.core.compiler

import com.opticdev.core.compiler.errors.{ErrorAccumulator, ParserNotFound}
import org.scalatest.FunSpec

class ErrorAccumulatorSpec extends FunSpec {

  it("Stores all known Compiler errors") {
    val errorAccumulator = new ErrorAccumulator
    errorAccumulator.add(ParserNotFound("","")(null))
  }

  it("Will opt to throw an internal error") {
    val errorAccumulator = new ErrorAccumulator
    assertThrows[NullPointerException] {
      errorAccumulator.add(new NullPointerException)
    }
  }

}
