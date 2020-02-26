package com.useoptic.diff.interactions.interpreters

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.diff.helpers.{DiffHelpers, SpecHelpers}
import com.useoptic.diff.interactions.TestHelpers
import com.useoptic.diff.interactions.interpretations.InteractionHelpers
import com.useoptic.types.capture.HttpInteraction
import org.scalatest.FunSpec
import io.circe.literal._

class DiffDescriptionInterpretersSpec extends FunSpec {
  describe("Request Content Type Diff") {
    it("should be x") {
      val rfcState: RfcState = TestHelpers.fromCommands(SpecHelpers.simplePost(json"""1"""))
      val interaction: HttpInteraction = InteractionHelpers.simplePost(json"""1""", 204, "text/plain")
      val diffs = DiffHelpers.diff(rfcState, interaction)
      assert(diffs.size == 1)
      val diff = diffs.head
      println(diff)
      val interpretation = new DiffDescriptionInterpreters(rfcState).interpret(diff, interaction)
      assert(interpretation.title == "The text/plain content type is not documented in the spec")
    }
  }
  describe("Response Content Type Diff") {
    it("should be x") {
      val rfcState: RfcState = TestHelpers.fromCommands(SpecHelpers.simpleGet(json"""1"""))
      val interaction: HttpInteraction = InteractionHelpers.simpleGet(json"""1""", 200, "text/plain")
      val diffs = DiffHelpers.diff(rfcState, interaction)
      assert(diffs.size == 1)
      val diff = diffs.head
      println(diff)
      val interpretation = new DiffDescriptionInterpreters(rfcState).interpret(diff, interaction)
      assert(interpretation.title == "The text/plain content type is not documented in the spec")
    }
  }
  describe("Response Body Diff") {
    describe("with a top level string") {
      it("should be x") {
        val rfcState: RfcState = TestHelpers.fromCommands(SpecHelpers.simpleGet(json"""1"""))
        val interaction: HttpInteraction = InteractionHelpers.simpleGet(json""""a"""")
        val diffs = DiffHelpers.diff(rfcState, interaction)
        assert(diffs.size == 1)
        val diff = diffs.head
        println(diff)
        val interpretation = new DiffDescriptionInterpreters(rfcState).interpret(diff, interaction)
        assert(interpretation.title == "The shape was not a number")
      }
    }
    describe("with a top level array") {
      it("should be x") {

        val rfcState: RfcState = TestHelpers.fromCommands(SpecHelpers.simpleGet(json"""[]"""))
        val interaction: HttpInteraction = InteractionHelpers.simpleGet(json"""1""")
        val diffs = DiffHelpers.diff(rfcState, interaction)
        assert(diffs.size == 1)
        val diff = diffs.head
        println(diff)
        val interpretation = new DiffDescriptionInterpreters(rfcState).interpret(diff, interaction)
        assert(interpretation.title == "The shape was not a List")
      }
    }
    describe("with a top level object") {
      it("should be x") {

        val rfcState: RfcState = TestHelpers.fromCommands(SpecHelpers.simpleGet(json"""{}"""))
        val interaction: HttpInteraction = InteractionHelpers.simpleGet(json"""1""")
        val diffs = DiffHelpers.diff(rfcState, interaction)
        assert(diffs.size == 1)
        val diff = diffs.head
        println(diff)
        val interpretation = new DiffDescriptionInterpreters(rfcState).interpret(diff, interaction)
        assert(interpretation.title == "The shape was not a Object")
      }
    }
    describe("with a nested object") {
      describe("with an extra key") {
        it("should be x") {
          val rfcState: RfcState = TestHelpers.fromCommands(SpecHelpers.simpleGet(json"""{}"""))
          val interaction: HttpInteraction = InteractionHelpers.simpleGet(json"""{"k":1}""")
          val diffs = DiffHelpers.diff(rfcState, interaction)
          assert(diffs.size == 1)
          val diff = diffs.head
          println(diff)
          val interpretation = new DiffDescriptionInterpreters(rfcState).interpret(diff, interaction)
          assert(interpretation.title == "The shape at key k was not expected")
        }
      }
      describe("with a missing key") {

        it("should be x") {
          val rfcState: RfcState = TestHelpers.fromCommands(SpecHelpers.simpleGet(json"""{"k": 1}"""))
          val interaction: HttpInteraction = InteractionHelpers.simpleGet(json"""{}""")
          val diffs = DiffHelpers.diff(rfcState, interaction)
          assert(diffs.size == 1)
          val diff = diffs.head
          println(diff)
          val interpretation = new DiffDescriptionInterpreters(rfcState).interpret(diff, interaction)
          assert(interpretation.title == "The shape at key k was not a number")
        }
      }
      describe("with a mismatched key") {

        it("should be x") {
          val rfcState: RfcState = TestHelpers.fromCommands(SpecHelpers.simpleGet(json"""{"k":"v"}"""))
          val interaction: HttpInteraction = InteractionHelpers.simpleGet(json"""{"k":1}""")
          val diffs = DiffHelpers.diff(rfcState, interaction)
          assert(diffs.size == 1)
          val diff = diffs.head
          println(diff)
          val interpretation = new DiffDescriptionInterpreters(rfcState).interpret(diff, interaction)
          assert(interpretation.title == "The shape at key k was not a string")
        }
      }
    }
    describe("with a list") {
      describe("with a mismatched item") {
        it("should be x") {
          val rfcState: RfcState = TestHelpers.fromCommands(SpecHelpers.simpleGet(json"""[{}]"""))
          val interaction: HttpInteraction = InteractionHelpers.simpleGet(json"""["a"]""")
          val diffs = DiffHelpers.diff(rfcState, interaction)
          assert(diffs.size == 1)
          val diff = diffs.head
          println(diff)
          val interpretation = new DiffDescriptionInterpreters(rfcState).interpret(diff, interaction)
          assert(interpretation.title == "The shape at index 0 was not a Object")
        }
      }
    }
  }
  describe("Response Status Code Diff") {
    it("should be x") {
      val rfcState: RfcState = TestHelpers.fromCommands(SpecHelpers.simpleGet(json"""1"""))
      val interaction: HttpInteraction = InteractionHelpers.simpleGet(json"""1""", 299)
      val diffs = DiffHelpers.diff(rfcState, interaction)
      assert(diffs.size == 1)
      val diff = diffs.head
      println(diff)
      val interpretation = new DiffDescriptionInterpreters(rfcState).interpret(diff, interaction)
      assert(interpretation.title == "The 299 status code is not documented in the spec")
    }
  }
}
