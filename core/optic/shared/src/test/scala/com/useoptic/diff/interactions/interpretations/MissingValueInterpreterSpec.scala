package com.useoptic.diff.interactions.interpretations

import com.useoptic.diff.JsonFileFixture
import com.useoptic.diff.helpers.DiffHelpers
import com.useoptic.diff.interactions.TestHelpers
import com.useoptic.diff.interactions.interpreters.MissingValueInterpreter
import com.useoptic.diff.shapes.resolvers.DefaultShapesResolvers
import org.scalatest.FunSpec

class MissingValueInterpreterSpec extends FunSpec with JsonFileFixture {
  describe("oneOf") {
    describe("given an array response") {
      val universe = eventsAndInteractionsFrom("list-with-oneof")
      it("should give a diff") {
        val rfcState = universe.rfcService.currentState(universe.rfcId)
        val resolvers = new DefaultShapesResolvers(rfcState)
        var diffs = DiffHelpers.diffAll(resolvers, rfcState, universe.interactions)
        assert(diffs.size == 3)
        val diff = diffs.head
        val interpretations = new MissingValueInterpreter(rfcState).interpret(diff, universe.interactions.head)
        println(interpretations)
        val newRfcState = TestHelpers.fromRfcStateAndCommands(universe.rfcService, interpretations.head.commands, universe.rfcId)
        val newResolvers = new DefaultShapesResolvers(newRfcState)
        diffs = DiffHelpers.diffAll(newResolvers, newRfcState, universe.interactions)
        diffs.foreach(println)
        assert(diffs.size == 3)
      }
    }
  }
}
