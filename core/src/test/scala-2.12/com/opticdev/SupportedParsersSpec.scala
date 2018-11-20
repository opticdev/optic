package com.opticdev

import com.opticdev.core.Fixture.TestBase
import com.opticdev.core.sourcegear.SGConfig
import com.opticdev.parsers.SourceParserManager
import play.api.libs.json.Json

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

  def testFixture = {
    SupportedParsers.init(withSkills = true)
    SGConfig(123456, null, Set(SourceParserManager.parserByLanguageName("es7").get.parserRef), Set(), Set(), Set(), Set(), Vector())
  }

  it("can parse various import types") {
    val a =
      """
        |import me from 'them'
        |import {it} from 'that'
        |const mee = require("path").a
        |
        |
      """.stripMargin

    val inflated = testFixture.inflate

    val result = inflated.parseString(a)(null, "es7")

    val importsFound = result.get.modelNodes.map(_.value).toSet

    assert(importsFound == Set(
      Json.parse("""{"imports":[{"local":"me","imported":"me","path":"them"}]}"""),
      Json.parse("""{"imports":[{"local":"it","imported":"it","path":"that"}]}"""),
      Json.parse("""{"local":"mee","path":"path","imported":"a"}""")))

  }

}
