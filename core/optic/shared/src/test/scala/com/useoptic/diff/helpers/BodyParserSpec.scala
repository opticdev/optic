package com.useoptic.diff.helpers

import com.useoptic.diff.JsonFileFixture
import com.useoptic.diff.interactions.BodyUtilities
import com.useoptic.serialization.InteractionSerialization
import org.scalatest.FunSpec

class BodyParserSpec extends FunSpec with JsonFileFixture {

  it("will parse JSON properly in an interaction with both json and shape hash") {
    val a = fromFile("example-poke.interaction")
    null
    val interaction = InteractionSerialization.fromJson(a)

    val parsedJsonLike = BodyUtilities.parseBody(interaction.response.body)
    null
  }

}
