package com.useoptic.diff

import org.scalatest.FunSpec

class SpecFromExampleSession extends FunSpec with JsonFileFixture {

  it("can load a universe from an example session") {
    val aidan2Universe = universeFromExampleSession("aidan-2")
    println(aidan2Universe)
  }

}
