package com.seamless.oas

import com.seamless.oas.versions.oas2.ResolverTestFixture
import org.scalatest.FunSpec
import play.api.libs.json.{JsObject, Json}

class ParserSpec extends ResolverTestFixture("2") {

  def pathToContents(file: String): String = {
    val loaded = scala.io.Source.fromFile(file)
    val source = loaded.getLines mkString "\n"
    loaded.close()
    source
  }

  it("will throw if invalid json") {
    assert(Parser.parseOAS("NOT JSON").isFailure)
  }

  it("works when valid") {
    val mattermost = Parser.parseOAS(pathToContents("src/main/resources/mattermost-2.json"))
    assert(mattermost.isSuccess)
  }

}
