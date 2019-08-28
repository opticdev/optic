package com.seamless.diff

import io.circe.Json
import io.circe.jawn.parseFile
import java.io.File

trait JsonFileFixture {
  def fromFile(slug: String): Json = {
    val filePath = "src/test/resources/diff-scenarios/" + slug + ".json"
    parseFile(new File(filePath)).right.get
  }
}