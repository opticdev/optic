package com.seamless.diff.initial

import com.seamless.Analytics
import com.seamless.contexts.rfc.{RfcService, RfcServiceJSFacade}
import com.seamless.contexts.shapes.Commands.{AddShape, ProviderInShape, RenameShape, SetParameterShape, ShapeProvider}
import com.seamless.diff.JsonFileFixture
import com.seamless.serialization.CommandSerialization
import org.scalatest.FunSpec

class ShapeBuilderSpec extends FunSpec with JsonFileFixture {

  it("can learn a basic concept with 3 string keys") {
    val basic = fromFile("basic-concept")
    val result = new ShapeBuilder(basic, "basic").run.asConceptNamed("Basic")
    assert(result.commands == commandsFrom("basic-concept"))
  }

  it("can learn a nested concept") {
    val basic = fromFile("nested-concept")
    val result = new ShapeBuilder(basic, "nested").run.asConceptNamed("Nested")
    assert(result.commands == commandsFrom("nested-concept"))
  }

  it("can learn with array of primitives") {
    val basic = fromFile("primitive-array")
    val result = new ShapeBuilder(basic, "pa").run.asConceptNamed("Array")
    assert(result.commands == commandsFrom("primitive-array"))
  }



  def fixture = {
    val basic = fromFile("todo")
    val result = new ShapeBuilder(basic, "Todo").run

    val eventStore = RfcServiceJSFacade.makeEventStore()
    val rfcService: RfcService = new RfcService(eventStore)
    rfcService.handleCommandSequence("id", result.commands :+
      RenameShape(result.examples.head.shapeId, "Todo"))
    rfcService.currentState("id").shapesState
  }


  it("can match json to a concept") {
    val basic = fromFile("todo")
    val f = fixture
    val result = new ShapeBuilder(basic, "ABC")(f).run
    assert(result.rootShapeId == "Todo_0")
    assert(result.commands.isEmpty)
  }

  it("can match json to a string") {
    val basic = fromFile("todo").asObject.get.toMap("task")
    val f = fixture
    val result = new ShapeBuilder(basic, "ABC")(f).run
    assert(result.commands.head.asInstanceOf[AddShape].baseShapeId == "$string")
  }

  it("can match json in array") {
    val basic = fromFile("todo-body")
    val f = fixture
    val result = new ShapeBuilder(basic, "ABC")(f).run
    //creates list
    assert(result.commands.size == 2)
    //points to known shape
    assert(result.commands(1).asInstanceOf[SetParameterShape]
      .shapeDescriptor.asInstanceOf[ProviderInShape]
      .providerDescriptor.asInstanceOf[ShapeProvider].shapeId == f.concepts.head._1)
  }

  it("works with nullable ") {
    val basic = fromFile("null-field")
    val result = new ShapeBuilder(basic, "n").run

    val eventStore = RfcServiceJSFacade.makeEventStore()
    val rfcService: RfcService = new RfcService(eventStore)
    println(CommandSerialization.toJson(result.commands))
    rfcService.handleCommandSequence("id", result.commands)
  }


  it("works with todo example") {
    val basic = fromFile("todo-body")
    val result = new ShapeBuilder(basic, "pa").run

    val eventStore = RfcServiceJSFacade.makeEventStore()
    val rfcService: RfcService = new RfcService(eventStore)
    println(CommandSerialization.toJson(result.commands))
    rfcService.handleCommandSequence("id", result.commands)
  }

  it("works with Twitter example") {
    val basic = fromFile("twitter-body")
    val result = new ShapeBuilder(basic, "tw").run

    val eventStore = RfcServiceJSFacade.makeEventStore()
    val rfcService: RfcService = new RfcService(eventStore)
    rfcService.handleCommandSequence("id", result.commands)
  }

  it("works with Readme example") {
    val basic = fromFile("readme-example")
    val result = new ShapeBuilder(basic, "rm").run

    val eventStore = RfcServiceJSFacade.makeEventStore()
    val rfcService: RfcService = new RfcService(eventStore)
    println(CommandSerialization.toJson(result.commands))
    rfcService.handleCommandSequence("id", result.commands)
  }
}
