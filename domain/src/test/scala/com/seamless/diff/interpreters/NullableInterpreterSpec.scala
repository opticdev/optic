package com.seamless.diff.interpreters

import com.seamless.contexts.requests.Commands._
import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.contexts.rfc.{RfcCommandContext, RfcServiceJSFacade}
import com.seamless.contexts.shapes.Commands._
import com.seamless.contexts.shapes.ShapesHelper._
import com.seamless.ddd.InMemoryEventStore
import com.seamless.diff.RequestDiffer._
import com.seamless.diff.ShapeDiffer._
import com.seamless.diff._
import io.circe.literal._
import org.scalatest.FunSpec

class NullableInterpreterSpec extends FunSpec {
  val rfcId = "test"
  val requestId = "req1"
  val responseId = "res1"
  val requestContentType = "ccc"

  val commandContext: RfcCommandContext = RfcCommandContext("a", "b", "c")

  def fromCommands(commands: Seq[RfcCommand]) = {
    val initialCommands = Seq(
      AddRequest(requestId, "root", "POST"),
      SetRequestBodyShape(requestId, ShapedBodyDescriptor(requestContentType, StringKind.baseShapeId, isRemoved = false)),
      AddResponse(responseId, requestId, 200)
    )
    val eventStore = new InMemoryEventStore[RfcEvent]
    RfcServiceJSFacade.fromCommands(eventStore, rfcId, initialCommands.toVector, commandContext)
    RfcServiceJSFacade.fromCommands(eventStore, rfcId, commands.toVector, commandContext).currentState(rfcId)
  }

  describe("when expecting a shape") {
    describe("when given null") {
      val interaction = ApiInteraction(
        ApiRequest("/", "POST", requestContentType, Some(json"""null""")),
        ApiResponse(200, requestContentType, None)
      )
      it("should offer to make it nullable") {
        val initialState = fromCommands(Seq.empty)
        val diff = RequestDiffer.compare(interaction, initialState)
        println(diff)
        val interpretations = new NullableInterpreter(initialState.shapesState).interpret(diff.next())
        assert(interpretations.length == 1)
        val interpretation = interpretations.head
        println(interpretation)
        val state = fromCommands(interpretation.commands)
        val updatedDiff = RequestDiffer.compare(interaction, state)
        assert(updatedDiff.isEmpty)
      }
    }
    describe("when given an incorrect shape") {
      val interaction = ApiInteraction(
        ApiRequest("/", "POST", requestContentType, Some(json"""1""")),
        ApiResponse(200, requestContentType, None)
      )
      it("should have a diff but offer no interpretation") {
        val initialState = fromCommands(Seq.empty)
        val diff = RequestDiffer.compare(interaction, initialState)
        assert(diff.hasNext)
        val next = diff.next()
        assert(next.isInstanceOf[UnmatchedRequestBodyShape])
        assert(next.asInstanceOf[UnmatchedRequestBodyShape].shapeDiff.isInstanceOf[ShapeMismatch])
        val interpretations = new NullableInterpreter(initialState.shapesState).interpret(next)
        assert(interpretations.isEmpty)
      }
    }
    describe("when given the correct shape") {
      val interaction = ApiInteraction(
        ApiRequest("/", "POST", requestContentType, Some(json""""asdf"""")),
        ApiResponse(200, requestContentType, None)
      )
      it("should have no diff or interpretation") {
        val initialState = fromCommands(Seq.empty)
        val diff = RequestDiffer.compare(interaction, initialState)
        assert(diff.isEmpty)
      }
    }
  }
  describe("when expecting a field shape") {
    val initialCommands = Seq(
      AddShape("o", ObjectKind.baseShapeId, ""),
      AddField("o.a", "o", "a", FieldShapeFromShape("o.a", StringKind.baseShapeId)),
      SetRequestBodyShape(requestId, ShapedBodyDescriptor(requestContentType, "o", isRemoved = false))
    )
    describe("when given null") {
      val interaction = ApiInteraction(
        ApiRequest("/", "POST", requestContentType, Some(json"""{"a":null}""")),
        ApiResponse(200, requestContentType, None)
      )
      it("should offer to make it nullable") {
        val initialState = fromCommands(initialCommands)
        val diff = RequestDiffer.compare(interaction, initialState)
        println(diff)
        val interpretations = new NullableInterpreter(initialState.shapesState).interpret(diff.next())
        assert(interpretations.length == 1)
        val interpretation = interpretations.head
        println(interpretation)
        val state = fromCommands(initialCommands ++ interpretation.commands)
        val updatedDiff = RequestDiffer.compare(interaction, state)
        assert(updatedDiff.isEmpty)
      }
    }
    describe("when given an incorrect shape") {
      val interaction = ApiInteraction(
        ApiRequest("/", "POST", requestContentType, Some(json"""{"a":1}""")),
        ApiResponse(200, requestContentType, None)
      )
      it("should have a diff but offer no interpretation") {
        val initialState = fromCommands(initialCommands)
        val diff = RequestDiffer.compare(interaction, initialState)
        assert(diff.hasNext)
        val next = diff.next()
        assert(next.isInstanceOf[UnmatchedRequestBodyShape])
        assert(next.asInstanceOf[UnmatchedRequestBodyShape].shapeDiff.isInstanceOf[KeyShapeMismatch])
        val interpretations = new NullableInterpreter(initialState.shapesState).interpret(next)
        assert(interpretations.isEmpty)
      }
    }
    describe("when given the correct shape") {
      val interaction = ApiInteraction(
        ApiRequest("/", "POST", requestContentType, Some(json"""{"a":"asdf"}""")),
        ApiResponse(200, requestContentType, None)
      )
      it("should have no diff or interpretation") {
        val initialState = fromCommands(initialCommands)
        val diff = RequestDiffer.compare(interaction, initialState)
        assert(diff.isEmpty)
      }
    }
  }
}
