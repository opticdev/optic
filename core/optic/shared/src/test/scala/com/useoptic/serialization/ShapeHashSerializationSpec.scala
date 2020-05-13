package com.useoptic.serialization

import com.useoptic.diff.JsonFileFixture
import org.scalatest.FunSpec

class ShapeHashSerializationSpec extends FunSpec with JsonFileFixture {
  it("parses shape hashes properly") {
    val todoUniverse = universeFromFilePath("optic/shared/src/test/resources/diff-scenarios/todo-dump.json")
    assert(todoUniverse.interactions.size == 3)
    assert(todoUniverse.interactions.forall(i => i.response.body.value.shapeHashV1Base64.isDefined))
  }
}
