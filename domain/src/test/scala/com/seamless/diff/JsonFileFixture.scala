package com.seamless.diff

import io.circe._
import io.circe.literal._


trait JsonFileFixture {
  def fromFile(slug: String): Json = {
    val loaded = scala.io.Source.fromFile("src/test/resources/diff-scenarios/" + slug + ".json")
    val source = loaded.getLines mkString "\n"
    println(source)
    loaded.close()

    val parsed = new JsonStringContext(new StringContext("[]")).json()
    println(parsed)
    println(parsed.isArray)
    parsed
  }
}
