package com.useoptic.diff.interpreters

import com.useoptic.contexts.requests.Commands.{AddRequest, AddResponse, SetRequestBodyShape, ShapedBodyDescriptor}
import com.useoptic.contexts.rfc.Commands.RfcCommand
import com.useoptic.contexts.rfc.Events.RfcEvent
import com.useoptic.contexts.rfc.{RfcCommandContext, RfcServiceJSFacade}
import com.useoptic.contexts.shapes.Commands.{AddShape, ProviderInShape, SetParameterShape, ShapeProvider}
import com.useoptic.contexts.shapes.ShapesHelper.StringKind
import com.useoptic.ddd.InMemoryEventStore
import com.useoptic.diff.RequestDiffer.RequestDiffResult
import com.useoptic.diff.initial.ShapeBuilder
import com.useoptic.diff.{ApiInteraction, ApiRequest, ApiResponse, PluginRegistryUtilities, RequestDiffer}
import org.scalatest.FunSpec
import io.circe.literal._


class OneOfInterpreterSpec extends FunSpec {
  val rfcId = "test"
  val requestId = "req1"
  val responseId = "res1"
  val requestContentType = "ccc"
  val commandContext: RfcCommandContext = RfcCommandContext("a", "b", "c")

  def fromCommands(commands: Seq[RfcCommand]) = {
    val eventStore = new InMemoryEventStore[RfcEvent]
    RfcServiceJSFacade.fromCommands(eventStore, rfcId, commands.toVector, commandContext).currentState(rfcId)
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
        ApiRequest("/", "POST", "", requestContentType, Some(json"""{"f":[1, "two", 3]}""")),
        ApiResponse(200, requestContentType, None)
      )
      it("should offer to make it a oneOf[string, number]") {
        val initialState = fromCommands(initialCommands)
        val diff = RequestDiffer.compare(interaction, initialState, PluginRegistryUtilities.defaultPluginRegistry(initialState.shapesState))
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
        val updatedDiff = RequestDiffer.compare(interaction, state, PluginRegistryUtilities.defaultPluginRegistry(state.shapesState))
        if (updatedDiff.hasNext) {
          updatedDiff.toVector.foreach(println)
          assert(false)
        }
        assert(updatedDiff.isEmpty)
      }
    }
  }

  describe("string or boolean or number") {
    val builtShape = new ShapeBuilder(json"""[{"f":"abc"}]""").run
    val initialCommands = builtShape.commands ++ Seq(
      AddRequest(requestId, "root", "POST"),
      SetRequestBodyShape(requestId, ShapedBodyDescriptor(requestContentType, builtShape.rootShapeId, isRemoved = false)),
      AddResponse(responseId, requestId, 200)
    )
    builtShape.commands.foreach(println)
    describe("all in initial payload") {
      val interaction = ApiInteraction(
        ApiRequest("/", "POST", "", requestContentType, Some(json"""[{"f":1},{"f":"one"},{"f":false}]""")),
        ApiResponse(200, requestContentType, None)
      )
      it("should offer to make it a oneof[string, boolean] and then a oneof[string, boolean, number]") {
        val initialState = fromCommands(initialCommands)
        val diff = RequestDiffer.compare(interaction, initialState, PluginRegistryUtilities.defaultPluginRegistry(initialState.shapesState))
        assert(diff.hasNext)

        def commandsAndDiff(initialCommands: Seq[RfcCommand], next: RequestDiffResult) = {
          val interpretations = new OneOfInterpreter(initialState.shapesState).interpret(next)
          interpretations.foreach(println)
          assert(interpretations.length == 1)
          val interpretation = interpretations.head
          interpretation.commands.foreach(println)
          val state = fromCommands(initialCommands ++ interpretation.commands)
          println("now i have applied the commands")
          val diff = RequestDiffer.compare(interaction, state, PluginRegistryUtilities.defaultPluginRegistry(state.shapesState))
          (interpretation.commands, diff)
        }

        val next = diff.next()
        println(next)
        val (firstCommands, firstDiff) = commandsAndDiff(initialCommands, next)
        assert(firstDiff.hasNext)
        val (secondCommands, secondDiff) = commandsAndDiff(initialCommands ++ firstCommands, firstDiff.next())
        assert(secondDiff.isEmpty)

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
        ApiRequest("/", "POST", "", requestContentType, Some(json"""[1, "two", 3]""")),
        ApiResponse(200, requestContentType, None)
      )
      it("should offer to make it a oneOf[string, number") {
        val initialState = fromCommands(initialCommands)
        val diff = RequestDiffer.compare(interaction, initialState, PluginRegistryUtilities.defaultPluginRegistry(initialState.shapesState))
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
        val updatedDiff = RequestDiffer.compare(interaction, state, PluginRegistryUtilities.defaultPluginRegistry(state.shapesState))
        if (updatedDiff.hasNext) {
          updatedDiff.toVector.foreach(println)
          assert(false)
        }
        assert(updatedDiff.isEmpty)
      }
    }
  }
}
