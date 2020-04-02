package com.useoptic.serialization

import java.io.File

import com.useoptic.diff.JsonFileFixture
import io.circe.Json
import io.circe.jawn.parseFile

import org.scalatest.FunSpec

class CapturesDeserialization extends FunSpec{
  def fromFile(slug: String): Json = {
    val filePath = "optic/shared/src/test/resources/captures/" + slug + ".json"
    val attempt = parseFile(new File(filePath))
    if (attempt.isLeft) {
      throw new Error(attempt.left.get)
    }
    attempt.right.get
  }

  it("can deserialize a poke API capture") {
    val jsonArray = fromFile("capture-pokeapi").asArray.get
    assert(jsonArray.map(InteractionSerialization.fromJson).exists(_.response.body.value.asShapeHashBytes.isDefined))
  }

}
