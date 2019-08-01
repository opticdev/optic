package com.seamless.serialization

import com.seamless.contexts.shapes.Commands._

import org.scalatest.FunSpec


class CommandSerializationSpec extends FunSpec {

  it("can serialize / deserialize commands with primitives and sub-classes") {

    val exampleCommands = Vector(
      AddShape("sss", "bbb-111", "nnn"),
      SetBaseShape("sss", "bbb-222"),
    )

    val asJson = CommandSerialization.toJson(exampleCommands)

    assert(asJson.noSpaces
      === """[{"AddShape":{"shapeId":"sss","baseShapeId":"bbb-111","name":"nnn"}},{"SetBaseShape":{"shapeId":"sss","baseShapeId":"bbb-222"}}]""")

    val decoded = CommandSerialization.fromJson(asJson)
    assert(decoded.isSuccess)
    assert(decoded.get == exampleCommands)

  }

}
