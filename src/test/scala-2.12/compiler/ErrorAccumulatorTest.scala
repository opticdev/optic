package compiler

import compiler_new.errors.{ErrorAccumulator, ParserNotFound}
import org.scalatest.FunSpec

class ErrorAccumulatorTest extends FunSpec {
  describe("Error Accumulator") {

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

}
