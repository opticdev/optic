package com.opticdev.core.storage.stores

import better.files.File
import com.opticdev.common.storage.DataDirectory
import com.opticdev.sdk.descriptions.Schema
import com.opticdev.parsers.SourceParserManager
import com.opticdev.parsers.ParserBase

import scala.util.{Failure, Try}

object ParserStorage {

  def writeToStorage(parser: File): File = {
    val isParser = SourceParserManager.verifyParser(parser.pathAsString)
    if (isParser.isSuccess) {
      val identifier = isParser.get.languageName+"_"+isParser.get.parserVersion
      val file = DataDirectory.parsers / identifier createIfNotExists(false)
      parser.copyTo(file, true)
    } else throw new Error("Invalid parser found in Jar.")
  }

  def loadParser(identifier: String): Try[ParserBase] = {
    val file = DataDirectory.parsers / identifier
    if (file.exists) {
      SourceParserManager.installParser(file.pathAsString)
    } else Failure(new Error("Parser with id "+identifier+" not found in storage"))
  }

  def loadAllParsers = {
    val directory = DataDirectory.parsers
    directory.list.foreach(i=> {
      val tryInstall = SourceParserManager.installParser(i.pathAsString)
      if (tryInstall.isFailure) println(Console.RED+  "Unable to load parser "+ i.pathAsString + Console.RESET)
    })
  }

}
