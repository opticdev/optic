package com.seamless.serialization

import com.seamless.contexts.requests.Commands._
import com.seamless.contexts.requests.Events._
import com.seamless.contexts.shapes.Commands._
import com.seamless.contexts.shapes.Events._
import org.scalatest.FunSpec


class EventSerializationSpec extends FunSpec {

  it("can serialize / deserialize events with primitives") {

    val exampleEvents = Vector(
      ShapeAdded("sss", "bbb", DynamicParameterList(Seq.empty), "nnn"),
      PathParameterAdded("123", "456", "789"),
    )

    val asJson = EventSerialization.toJson(exampleEvents)

    assert(asJson.noSpaces
      === """[{"ShapeAdded":{"shapeId":"sss","baseShapeId":"bbb","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":"nnn"}},{"PathParameterAdded":{"pathId":"123","parentPathId":"456","name":"789"}}]""")

    val decoded = EventSerialization.fromJson(asJson)
    assert(decoded.isSuccess)
    assert(decoded.get == exampleEvents)
  }

  it("primitives and subtypes") {

    val exampleEvents = Vector(
      ShapeAdded("sss", "bbb", NoParameterList(), "hij"),
      PathParameterAdded("123", "456", "789"),
      ResponseBodySet("Abc", ShapedBodyDescriptor("text/html", "id", isRemoved = false))
    )

    val asJson = EventSerialization.toJson(exampleEvents)

    assert(asJson.noSpaces
      === """[{"ShapeAdded":{"shapeId":"sss","baseShapeId":"bbb","parameters":{"NoParameterList":{}},"name":"hij"}},{"PathParameterAdded":{"pathId":"123","parentPathId":"456","name":"789"}},{"ResponseBodySet":{"responseId":"Abc","bodyDescriptor":{"httpContentType":"text/html","shapeId":"id","isRemoved":false}}}]""")


    val decoded = EventSerialization.fromJson(asJson)
    assert(decoded.isSuccess)
    assert(decoded.get == exampleEvents)

  }

}
