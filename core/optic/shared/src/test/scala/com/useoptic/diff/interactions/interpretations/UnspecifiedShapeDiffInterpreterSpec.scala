package com.useoptic.diff.interactions.interpretations

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.diff.helpers.{DiffHelpers, SpecHelpers}
import com.useoptic.diff.interactions.TestHelpers
import com.useoptic.diff.interactions.interpreters.UnspecifiedShapeDiffInterpreter
import com.useoptic.types.capture.HttpInteraction
import org.scalatest.FunSpec
import io.circe.literal._

class UnspecifiedShapeDiffInterpreterSpec extends FunSpec {
  describe("response body unspecified shape") {
    val initialCommands = SpecHelpers.simpleGet(json"""{"x": {"k": "v"}}""")
    val rfcState: RfcState = TestHelpers.fromCommands(initialCommands)

    describe("unexpected object key") {
      it("should suggest adding a field") {
        val interaction: HttpInteraction = InteractionHelpers.simpleGet(json"""{"x":{"k":"v","surprise":"!"}}""")
        val diffs = DiffHelpers.diff(rfcState, interaction)
        assert(diffs.size == 1)
        val diff = diffs.head
        println(diff)
        val interpreter = new UnspecifiedShapeDiffInterpreter(rfcState)
        val interpretations = interpreter.interpret(diff, interaction)
        assert(interpretations.size == 1)
        val interpretation = interpretations.head
        println(interpretation)
        val newRfcState = TestHelpers.fromCommands(initialCommands ++ interpretation.commands)
        val newDiffs = DiffHelpers.diff(newRfcState, interaction)
        assert(newDiffs.isEmpty)
      }
    }
  }

  describe("request body unspecified shape") {

    val initialCommands = SpecHelpers.simplePost(json"""{"x": {"k": "v"}}""")
    val rfcState: RfcState = TestHelpers.fromCommands(initialCommands)
    it("should suggest adding a field") {
      val interaction: HttpInteraction = InteractionHelpers.simplePost(json"""{"x":{"k":"v","surprise":"!"}}""", 204)
      val diffs = DiffHelpers.diff(rfcState, interaction)
      assert(diffs.size == 1)
      val diff = diffs.head
      println(diff)
      val interpreter = new UnspecifiedShapeDiffInterpreter(rfcState)
      val interpretations = interpreter.interpret(diff, interaction)
      assert(interpretations.size == 1)
      val interpretation = interpretations.head
      println(interpretation)
      val newRfcState = TestHelpers.fromCommands(initialCommands ++ interpretation.commands)
      val newDiffs = DiffHelpers.diff(newRfcState, interaction)
      assert(newDiffs.isEmpty)
    }

  }
}
