package com.opticdev.opm.storage

import better.files.File
import com.opticdev.common.storage.DataDirectory
import com.opticdev.parsers.{ParserRef, SourceParserManager}
import org.scalatest.FunSpec

class ParserStorageSpec extends FunSpec {

  lazy val fakeParserJar = File("test-examples/resources/example_parsers/fake-parser-0.1.0.jar")

  it("can save parsers to local") {
    val parserSaved = ParserStorage.writeToStorage(fakeParserJar)
    println(parserSaved)
    assert(parserSaved.isSuccess)
  }

  it("can lookup items from local") {
    val parserLoad = ParserStorage.loadFromStorage(ParserRef("Fake", "0.1.0"))
    assert(parserLoad.isSuccess)
    assert(parserLoad.get.languageName == "Fake")
  }

  it("can load parser by version 'latest'") {
    val parserLoad = ParserStorage.loadFromStorage(ParserRef("Fake", "latest"))
    assert(parserLoad.isSuccess)
    assert(parserLoad.get.languageName == "Fake")
    assert(parserLoad.get.parserVersion == "0.1.0")
  }

  it("can clear all local parsers") {
    ParserStorage.writeToStorage(fakeParserJar)
    ParserStorage.clearLocalParsers
    assert(ParserStorage.listAllParsers.isEmpty)
  }

  it("can load all parsers") {
    ParserStorage.clearLocalParsers
    ParserStorage.writeToStorage(fakeParserJar)
    val listAll = ParserStorage.listAllParsers
                  .mapValues(_.map(_.parserRef))
    assert(listAll == Map("Fake" -> Vector(ParserRef("Fake", "0.1.0"))))
  }

}
