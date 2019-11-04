package com.seamless.diff.initial

import com.seamless.contexts.rfc.{RfcCommandContext, RfcService, RfcServiceJSFacade}
import com.seamless.contexts.shapes.Commands.RenameShape
import com.seamless.contexts.shapes.ShapesHelper.{BooleanKind, NumberKind, StringKind}
import com.seamless.diff.JsonFileFixture
import org.scalatest.FunSpec
import io.circe.jawn.parse

class ShapeResolverSpec extends FunSpec with JsonFileFixture {
  val commandContext: RfcCommandContext = RfcCommandContext("a", "b", "c")

  def fixture(name: String) = {
    val basic = fromFile(name)
    val result = new ShapeBuilder(basic, name).run

    val eventStore = RfcServiceJSFacade.makeEventStore()
    val rfcService: RfcService = new RfcService(eventStore)
    rfcService.handleCommandSequence("id", result.commands :+
      RenameShape(result.examples.head.shapeId, name), commandContext)
    rfcService.currentState("id").shapesState
  }

  it("can resolve primitives") {
    val f = fixture("todo")
    val string = ShapeResolver.resolveJsonToShapeId(parse("\"hello\"").right.get)(f)
    assert(string.contains(StringKind.baseShapeId))

    val number = ShapeResolver.resolveJsonToShapeId(parse("12").right.get)(f)
    assert(number.contains(NumberKind.baseShapeId))

    val boolean = ShapeResolver.resolveJsonToShapeId(parse("true").right.get)(f)
    assert(boolean.contains(BooleanKind.baseShapeId))
  }


  it("can match json to a concept") {

    val basic = fromFile("todo")
    val f = fixture("todo")
    val a = ShapeResolver.resolveJsonToShapeId(basic)(f)
    assert(a.contains("Todo_0"))

  }

  it("can match json to a concept with unknown") {
    //@todo will not work until shape differ understands unknown
    val basic = fromFile("todowith-unknown")
    val f = fixture("todowith-unknown")
    val a = ShapeResolver.resolveJsonToShapeId(basic)(f)
  }


}
