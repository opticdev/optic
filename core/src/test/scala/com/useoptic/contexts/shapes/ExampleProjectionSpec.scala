package com.useoptic.contexts.shapes

import com.useoptic.contexts.shapes.projections.ExampleProjection
import com.useoptic.diff.JsonFileFixture
import org.scalatest.FunSpec
import io.circe.jawn.parse
class ExampleProjectionSpec extends FunSpec with JsonFileFixture {
  it("works for strings") {
    val json = parse("\"Hello\"").right.get
    val render = ExampleProjection.fromJson(json, "")
    assert(render.root.typeName.map(_.name).mkString(" ") == "\"Hello\"")
  }

  it("works for objects") {
    val basic = fromFile("basic-concept")
    val render = ExampleProjection.fromJson(basic, "")
    assert(render.root.fields.size == 3)
  }

  it("works for arrays") {
    val basic = fromFile("primitive-array")
    val render = ExampleProjection.fromJson(basic, "")
    assert(render.root.fields.size == 3)
  }
}
