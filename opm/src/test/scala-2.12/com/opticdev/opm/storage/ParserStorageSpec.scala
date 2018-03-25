package com.opticdev.opm.storage

import better.files.File
import com.opticdev.common.storage.DataDirectory
import com.opticdev.parsers.{ParserRef, SourceParserManager}
import org.scalatest.{BeforeAndAfterAll, FunSpec}

class ParserStorageSpec extends FunSpec with BeforeAndAfterAll {

  override def beforeAll(): Unit = {
    DataDirectory.init
    super.beforeAll()
  }

  val parserVersion = "0.1.2"

  lazy val parserJar = File("server/src/main/resources/es7_2.12-0.1.2.jar")

  it("can save parsers to local") {
    val parserSaved = ParserStorage.writeToStorage(parserJar)
    assert(parserSaved.isSuccess)
  }

  it("can lookup items from local") {
    val parserLoad = ParserStorage.loadFromStorage(ParserRef("es7", parserVersion))
    assert(parserLoad.isSuccess)
    assert(parserLoad.get.languageName == "es7")
  }

  it("can load parser by version 'latest'") {
    val parserLoad = ParserStorage.loadFromStorage(ParserRef("es7", "latest"))
    assert(parserLoad.isSuccess)
    assert(parserLoad.get.languageName == "es7")
    assert(parserLoad.get.parserVersion == parserVersion)
  }

  it("can clear all local parsers") {
    ParserStorage.writeToStorage(parserJar)
    ParserStorage.clearLocalParsers
    assert(ParserStorage.listAllParsers.isEmpty)
  }

  it("can load all parsers") {
    ParserStorage.clearLocalParsers
    ParserStorage.writeToStorage(parserJar)
    val listAll = ParserStorage.listAllParsers
                  .mapValues(_.map(_.parserRef))
    assert(listAll == Map("es7" -> Vector(ParserRef("es7", parserVersion))))
  }

}
