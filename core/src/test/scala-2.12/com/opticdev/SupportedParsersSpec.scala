package com.opticdev

import com.opticdev.core.Fixture.TestBase
import com.opticdev.parsers.SourceParserManager

class SupportedParsersSpec extends TestBase {

  it("can load supported parsers") {
    SupportedParsers.init(withSkills = false)
    assert(SourceParserManager.installedParsers.size == 1)
  }

  it("can compile parser skills") {
    val result = SupportedParsers.initIncludedSkills(SupportedParsers.parsers.head, false, false)
    assert(result.isSuccess)
  }

  it("can save to disk") {
    val result = SupportedParsers.initIncludedSkills(SupportedParsers.parsers.head, false, false)
    val file = ParserSkillsColdStorage.saveToDisk(result.get)
    assert(file.exists)
  }

  it("can load from disk") {
    val result = SupportedParsers.initIncludedSkills(SupportedParsers.parsers.head, false, false)
    ParserSkillsColdStorage.saveToDisk(result.get)
    val coldStorage = ParserSkillsColdStorage.loadFromDisk(SupportedParsers.parsers.head.parserRef)

    assert(coldStorage.get == result.get)
  }

}
