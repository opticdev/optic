package com.seamless.serialization

import com.seamless.contexts.data_types.Commands.{AssignType, DefineConcept}
import com.seamless.contexts.data_types.Events.{ConceptDefined, DataTypesEvent}
import com.seamless.contexts.data_types.Primitives.StringT
import com.seamless.contexts.requests.Commands.ShapedBodyDescriptor
import com.seamless.contexts.requests.Events.{PathParameterAdded, ResponseBodySet}
import io.circe.generic.auto._
import io.circe.syntax._
import org.scalatest.FunSpec


class CommandSerializationSpec extends FunSpec {

  it("can serialize / deserialize commands with primitives and sub-classes") {

    val exampleCommands = Vector(
      DefineConcept("abc", "def", "hij"),
      AssignType("123", StringT, "789"),
    )

    val asJson = CommandSerialization.toJson(exampleCommands)

    assert(asJson.noSpaces
      === """[{"DefineConcept":{"name":"abc","rootId":"def","conceptId":"hij"}},{"AssignType":{"id":"123","to":{"StringT":{}},"conceptId":"789"}}]""")

    val decoded = CommandSerialization.fromJson(asJson)
    assert(decoded.isSuccess)
    assert(decoded.get == exampleCommands)

  }

}
