package com.useoptic.diff.initial

import com.useoptic.contexts.rfc.{RfcCommandContext, RfcService, RfcServiceJSFacade}
import com.useoptic.contexts.shapes.Commands._
import com.useoptic.diff.JsonFileFixture
import com.useoptic.serialization.CommandSerialization
import com.useoptic.types.capture.JsonLikeFrom
import org.scalatest.FunSpec

class ShapeBuilderSpec extends FunSpec with JsonFileFixture {
  val commandContext: RfcCommandContext = RfcCommandContext("a", "b", "c")
  it("can learn a basic concept with 3 string keys") {
    val basic = fromFile("basic-concept")
    val result = new ShapeBuilder(JsonLikeFrom.json(basic).get, "basic").run.asConceptNamed("Basic")
    assert(result.commands == commandsFrom("basic-concept"))
  }

  it("can learn a nested concept") {
    val basic = fromFile("nested-concept")
    val result = new ShapeBuilder(JsonLikeFrom.json(basic).get, "nested").run.asConceptNamed("Nested")
    assert(result.commands == commandsFrom("nested-concept"))
  }

  it("can learn with array of primitives") {
    val basic = fromFile("primitive-array")
    val result = new ShapeBuilder(JsonLikeFrom.json(basic).get, "pa").run.asConceptNamed("Array")
    assert(result.commands == commandsFrom("primitive-array"))
  }

  def fixture = {
    val basic = fromFile("todo")
    val result = new ShapeBuilder(JsonLikeFrom.json(basic).get, "Todo").run
    val eventStore = RfcServiceJSFacade.makeEventStore()
    val rfcService: RfcService = new RfcService(eventStore)
    rfcService.handleCommandSequence("id", result.commands, commandContext)
    rfcService.currentState("id").shapesState
  }


  it("can match json to a concept") {
    val basic = fromFile("todo")
    val f = fixture
    val result = new ShapeBuilder(JsonLikeFrom.json(basic).get, "ABC")(f).run
    assert(result.rootShapeId == "Todo_0")
    assert(result.commands.isEmpty)
  }

  it("can match json to a string") {
    val basic = fromFile("todo").asObject.get.toMap("task")
    val f = fixture
    val result = new ShapeBuilder(JsonLikeFrom.json(basic).get, "ABC")(f).run
    assert(result.commands.head.asInstanceOf[AddShape].baseShapeId == "$string")
  }

  it("can match json in array") {
    val basic = fromFile("todo-body")
    val f = fixture
    val result = new ShapeBuilder(JsonLikeFrom.json(basic).get, "ABC")(f).run
    //creates list
    assert(result.commands.size == 2)
    //points to known shape
    assert(result.commands(1).asInstanceOf[SetParameterShape]
      .shapeDescriptor.asInstanceOf[ProviderInShape]
      .providerDescriptor.asInstanceOf[ShapeProvider].shapeId == f.concepts.head._1)
  }

  it("works with nullable ") {
    val basic = fromFile("null-field")
    val result = new ShapeBuilder(JsonLikeFrom.json(basic).get, "n").run

    val eventStore = RfcServiceJSFacade.makeEventStore()
    val rfcService: RfcService = new RfcService(eventStore)
    println(CommandSerialization.toJson(result.commands))
    rfcService.handleCommandSequence("id", result.commands, commandContext)
  }


  it("works with todo example") {
    val basic = fromFile("todo-body")
    val result = new ShapeBuilder(JsonLikeFrom.json(basic).get, "pa").run

    val eventStore = RfcServiceJSFacade.makeEventStore()
    val rfcService: RfcService = new RfcService(eventStore)
    println(CommandSerialization.toJson(result.commands))
    rfcService.handleCommandSequence("id", result.commands, commandContext)
  }

  it("works with Twitter example") {
    val basic = fromFile("twitter-body")
    val result = new ShapeBuilder(JsonLikeFrom.json(basic).get, "tw").run

    val eventStore = RfcServiceJSFacade.makeEventStore()
    val rfcService: RfcService = new RfcService(eventStore)
    rfcService.handleCommandSequence("id", result.commands, commandContext)
  }

  it("works with Readme example") {
    val basic = fromFile("readme-example")
    val result = new ShapeBuilder(JsonLikeFrom.json(basic).get, "rm").run

    val eventStore = RfcServiceJSFacade.makeEventStore()
    val rfcService: RfcService = new RfcService(eventStore)
    println(CommandSerialization.toJson(result.commands))
    rfcService.handleCommandSequence("id", result.commands, commandContext)
  }

}
