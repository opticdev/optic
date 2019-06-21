package com.seamless.serialization

import com.seamless.contexts.data_types.Events.{ConceptDefined, DataTypesEvent}
import com.seamless.contexts.requests.Commands.ShapedBodyDescriptor
import com.seamless.contexts.requests.Events.{PathParameterAdded, ResponseBodySet}
import org.scalatest.FunSpec
import io.circe._
import io.circe.generic.auto._
import io.circe.parser._
import io.circe.syntax._


class EventSerializationSpec extends FunSpec {

  it("can serialize / deserialize events with primitives") {

    val exampleEvents = Vector(
      ConceptDefined("abc", "def", "hij"),
      PathParameterAdded("123", "456", "789"),
    )

    val asJson = EventSerialization.toJson(exampleEvents)

    assert(asJson.noSpaces
      === """[{"ConceptDefined":{"name":"abc","root":"def","id":"hij"}},{"PathParameterAdded":{"pathId":"123","parentPathId":"456","name":"789"}}]""")

    val decoded = EventSerialization.fromJson(asJson)
    assert(decoded.isSuccess)
    assert(decoded.get == exampleEvents)
  }

  it("primitives and subtypes") {

    val exampleEvents = Vector(
      ConceptDefined("abc", "def", "hij"),
      PathParameterAdded("123", "456", "789"),
      ResponseBodySet("Abc", ShapedBodyDescriptor("text/html", "id", isRemoved = false))
    )

    val asJson = EventSerialization.toJson(exampleEvents)

    assert(asJson.noSpaces
      === """[{"ConceptDefined":{"name":"abc","root":"def","id":"hij"}},{"PathParameterAdded":{"pathId":"123","parentPathId":"456","name":"789"}},{"ResponseBodySet":{"responseId":"Abc","bodyDescriptor":{"httpContentType":"text/html","conceptId":"id","isRemoved":false}}}]""")


    val decoded = EventSerialization.fromJson(asJson)
    assert(decoded.isSuccess)
    assert(decoded.get == exampleEvents)

  }

}
