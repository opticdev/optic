package com.seamless.diff.initial

import com.seamless.contexts.rfc.{RfcService, RfcServiceJSFacade}
import com.seamless.contexts.shapes.Commands.RenameShape
import com.seamless.contexts.shapes.ShapesHelper.{BooleanKind, NumberKind, StringKind}
import com.seamless.diff.JsonFileFixture
import org.scalatest.FunSpec
import io.circe.jawn.parse

class ShapeResolverSpec extends FunSpec with JsonFileFixture {

  def fixture = {
    val basic = fromFile("todo")
    val result = new ShapeBuilder(basic, "Todo").run

    val eventStore = RfcServiceJSFacade.makeEventStore()
    val rfcService: RfcService = new RfcService(eventStore)
    rfcService.handleCommandSequence("id", result.commands :+
      RenameShape(result.examples.head.shapeId, "Todo"))
    rfcService.currentState("id").shapesState
  }

  it("can resolve primitives") {
    val f = fixture
    val string = ShapeResolver.resolveJsonToShapeId(parse("\"hello\"").right.get)(f)
    assert(string.contains(StringKind.baseShapeId))

    val number = ShapeResolver.resolveJsonToShapeId(parse("12").right.get)(f)
    assert(number.contains(NumberKind.baseShapeId))

    val boolean = ShapeResolver.resolveJsonToShapeId(parse("true").right.get)(f)
    assert(boolean.contains(BooleanKind.baseShapeId))
  }

  it("can match json to a concept") {
    val basic = fromFile("todo")
    val f = fixture
    val a = ShapeResolver.resolveJsonToShapeId(basic)(f)
    assert(a.contains("Todo_0"))
  }


}
