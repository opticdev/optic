package com.useoptic.diff.interactions.interpretations

import com.useoptic.diff.JsonFileFixture
import com.useoptic.diff.helpers.DiffHelpers
import com.useoptic.diff.interactions.TestHelpers
import com.useoptic.diff.interactions.interpreters.MissingValueInterpreter
import org.scalatest.FunSpec

class MissingValueInterpreterSpec extends FunSpec with JsonFileFixture {
  describe("oneOf") {
    describe("given an array response") {
      val universe = eventsAndInteractionsFrom("list-with-oneof")
      it("should give a diff") {
        val rfcState = universe.rfcService.currentState(universe.rfcId)
        var diffs = DiffHelpers.diffAll(rfcState, universe.interactions)
        assert(diffs.size == 3)
        val diff = diffs.head
        val interpretations = new MissingValueInterpreter(rfcState).interpret(diff, universe.interactions.head)
        println(interpretations)
        val newRfcState = TestHelpers.fromRfcStateAndCommands(universe.rfcService, interpretations.head.commands, universe.rfcId)
        diffs = DiffHelpers.diffAll(newRfcState, universe.interactions)
        diffs.foreach(println)
        assert(diffs.size == 3)
      }
    }
  }
}
