package com.seamless.diff.initial

import com.seamless.diff.JsonFileFixture
import com.seamless.serialization.CommandSerialization
import org.scalatest.FunSpec

class ShapeBuilderSpec extends FunSpec with JsonFileFixture {

  it("can learn a basic concept with 3 string keys") {
    val basic = fromFile("basic-concept")
    val commands = new ShapeBuilder(basic, "basic").run
    assert(commands == commandsFrom("basic-concept"))
  }

  it("can learn a nested concept") {
    val basic = fromFile("nested-concept")
    val commands = new ShapeBuilder(basic, "nested").run
    assert(commands == commandsFrom("nested-concept"))
  }

  it("can learn with array of primitives") {
    val basic = fromFile("primitive-array")
    val commands = new ShapeBuilder(basic, "pa").run
    println(CommandSerialization.toJson(commands))
    assert(commands == commandsFrom("primitive-array"))
  }

}
