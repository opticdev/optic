package com.opticdev.opm.storage

import java.io.FileNotFoundException

import better.files.File
import com.opticdev.common.PackageRef
import com.opticdev.common.storage.DataDirectory
import com.opticdev.parsers.{ParserBase, ParserRef, SourceParserManager}

import scala.util.{Failure, Try}

object ParserStorage {

  def writeToStorage(parserJar: File): Try[File] = Try {

    if (!parserJar.exists) throw new FileNotFoundException(parserJar.pathAsString+" is not a file")

    val loadAsParser = SourceParserManager.verifyParser(parserJar.pathAsString)

    if (loadAsParser.isSuccess) {
      val parser = loadAsParser.get
      val parserFolder = DataDirectory.parsers / parser.languageName createIfNotExists(true)

      val parserVersion = parserFolder / (parser.parserVersion + ".jar")
      parserJar.copyTo(parserVersion, overwrite = true)
      parserVersion
    } else {
      throw new Error("Invalid Optic Parser at "+ parserJar.pathAsString)
    }

  }

  def loadFromStorage(parserRef: ParserRef) : Try[ParserBase] = {

    val parser = DataDirectory.parsers / parserRef.packageId / (parserRef.version + ".jar")

    if (parser.exists) {
      SourceParserManager.verifyParser(parser.pathAsString)
    } else {
      throw new Error("Parser not found "+ parserRef.full)
    }

  }

  def listAllParsers : Map[String, Vector[ParserBase]] = {
    val directory = DataDirectory.parsers
    directory.children.filter(_.isDirectory).map(i=> {
      val parserVerifications = i.list.map(p=>  SourceParserManager.verifyParser(p.pathAsString))
      i.name -> parserVerifications.filter(_.isSuccess).map(_.get).toVector
    }).toMap
  }

  def clearLocalParsers = {
    DataDirectory.parsers.list.foreach(_.delete(true))
  }

}
