package com.opticdev.core.sourcegear.storage

import better.files.File
import com.opticdev.core.sourcegear.storage.ParserStorage
import org.scalatest.FunSpec

class ParserStorageSpec extends FunSpec {

  val parserPath = System.getProperty("user.home")+"/Developer/knack/parsers/javascript-lang/target/scala-2.12/javascript-lang_2.12-1.0.jar"

  var file : File =  null
  it("can write a parser to storage") {
    file = ParserStorage.writeToStorage(File(parserPath))
    assert(file.exists)
  }

  it("can read back in") {
    assert(ParserStorage.loadParser("Javascript_1.0").isSuccess)
  }

}
