package com.opticdev.core

import com.opticdev.core.Fixture.TestBase
import com.opticdev.parsers.SourceParserManager

class ParserSpec extends TestBase {

  it("Can have parsers cleared") {
    SourceParserManager.clearParsers
    assert(SourceParserManager.installedParsers.isEmpty)
  }

  it("Can install a parser") {
    SourceParserManager.clearParsers

    val result = SourceParserManager.installParser(System.getProperty("user.home")+"/Developer/knack/parsers/javascript-lang/target/scala-2.12/javascript-lang_2.12-1.0.jar")
    assert(result.isSuccess)
    assert(SourceParserManager.installedParsers.size == 1)
  }

  it("Can parse a string with installed parser") {
    val didParse = SourceParserManager.parseString("var test = 1+1", "Javascript")
    assert(didParse != null)
  }

}
