package com.seamless.diff.interpreters

import com.seamless.contexts.requests.Commands.{AddRequest, AddResponse, SetRequestBodyShape, ShapedBodyDescriptor}
import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.contexts.rfc.RfcServiceJSFacade
import com.seamless.contexts.shapes.Commands.{AddShape, ProviderInShape, SetParameterShape, ShapeProvider}
import com.seamless.contexts.shapes.ShapesHelper.StringKind
import com.seamless.ddd.InMemoryEventStore
import com.seamless.diff.initial.ShapeBuilder
import com.seamless.diff.{ApiInteraction, ApiRequest, ApiResponse, RequestDiffer}
import org.scalatest.FunSpec
import io.circe.literal._


class OneOfInterpreterSpec extends FunSpec {
  val rfcId = "test"
  val requestId = "req1"
  val responseId = "res1"
  val requestContentType = "ccc"

  def fromCommands(commands: Seq[RfcCommand]) = {
    val eventStore = new InMemoryEventStore[RfcEvent]
    RfcServiceJSFacade.fromCommands(eventStore, commands.toVector, rfcId).currentState(rfcId)
  }

  describe("Object with a field that is a list of strings and numbers") {
    val builtShape = new ShapeBuilder(json"""{"f":[123]}""").run
    val initialCommands = builtShape.commands ++ Seq(
      AddRequest(requestId, "root", "POST"),
      SetRequestBodyShape(requestId, ShapedBodyDescriptor(requestContentType, builtShape.rootShapeId, isRemoved = false)),
      AddResponse(responseId, requestId, 200)
    )
    builtShape.commands.foreach(println)
    describe("both in the initial payload") {
      val interaction = ApiInteraction(
        ApiRequest("/", "POST", requestContentType, Some(json"""{"f":[1, "two", 3]}""")),
        ApiResponse(200, requestContentType, None)
      )
      it("should offer to make it a oneOf[string, number]") {
        val initialState = fromCommands(initialCommands)
        val diff = RequestDiffer.compare(interaction, initialState)
        assert(diff.hasNext)
        val next = diff.next()
        println(next)
        val interpretations = new OneOfInterpreter(initialState.shapesState).interpret(next)
        interpretations.foreach(println)
        assert(interpretations.length == 1)
        assert(interpretations.length == 1)
        val interpretation = interpretations.head
        interpretation.commands.foreach(println)
        val state = fromCommands(initialCommands ++ interpretation.commands)
        println("now i have applied the commands")
        val updatedDiff = RequestDiffer.compare(interaction, state)
        if (updatedDiff.hasNext) {
          updatedDiff.toVector.foreach(println)
          assert(false)
        }
        assert(updatedDiff.isEmpty)
      }
    }
  }

  describe("List of strings and numbers") {
    val initialCommands = Seq(
      AddRequest(requestId, "root", "POST"),
      AddShape("$listWrapper", "$list", ""),
      SetParameterShape(ProviderInShape("$listWrapper", ShapeProvider(StringKind.baseShapeId), "$listItem")),
      SetRequestBodyShape(requestId, ShapedBodyDescriptor(requestContentType, "$listWrapper", isRemoved = false)),
      AddResponse(responseId, requestId, 200)
    )
    describe("both in the initial payload") {

      val interaction = ApiInteraction(
        ApiRequest("/", "POST", requestContentType, Some(json"""[1, "two", 3]""")),
        ApiResponse(200, requestContentType, None)
      )
      it("should offer to make it a oneOf[string, number") {
        val initialState = fromCommands(initialCommands)
        val diff = RequestDiffer.compare(interaction, initialState)
        assert(diff.hasNext)
        val next = diff.next()
        println(next)
        val interpretations = new OneOfInterpreter(initialState.shapesState).interpret(next)
        interpretations.foreach(println)
        assert(interpretations.length == 1)
        val interpretation = interpretations.head
        interpretation.commands.foreach(println)
        val state = fromCommands(initialCommands ++ interpretation.commands)
        println("now i have applied the commands")
        val updatedDiff = RequestDiffer.compare(interaction, state)
        if (updatedDiff.hasNext) {
          updatedDiff.toVector.foreach(println)
          assert(false)
        }
        assert(updatedDiff.isEmpty)
      }
    }
  }
}
