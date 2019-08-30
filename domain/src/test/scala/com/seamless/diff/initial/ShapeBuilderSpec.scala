package com.seamless.diff.initial

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

}
