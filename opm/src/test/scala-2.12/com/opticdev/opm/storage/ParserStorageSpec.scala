package com.opticdev.opm.storage

import better.files.File
import com.opticdev.common.ParserRef
import com.opticdev.common.storage.DataDirectory
import com.opticdev.parsers.SourceParserManager
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

}
