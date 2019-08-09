package com.seamless.oas

import org.scalatest.FunSpec
import play.api.libs.json.{JsObject, Json}

import scala.util.Try

class ParserSpec extends ResolverTestFixture("2") {

  def pathToContents(file: String): String = {
    val loaded = scala.io.Source.fromFile(file)
    val source = loaded.getLines mkString "\n"
    loaded.close()
    source
  }

  it("will throw if invalid json") {
    assert(Try(Parser.parseOAS("NOT JSON")).isFailure)
  }

  it("works on a version 2 when valid") {
    val mattermost = Parser.parseOAS(pathToContents("src/test/resources/mattermost-2.json"))
    println(mattermost)
  }

  it("works on a version 3 when valid") {
    val bbc = Parser.parseOAS(pathToContents("src/test/resources/bbc-3.json"))
    println(bbc)
  }

}
