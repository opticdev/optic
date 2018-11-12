package com.opticdev.opm.storage

import java.io.FileNotFoundException

import better.files.File
import com.opticdev.common.{PackageRef, ParserRef}
import com.opticdev.common.storage.DataDirectory
import com.opticdev.common.utils.SemverHelper
import com.opticdev.common.utils.SemverHelper.VersionWrapper
import com.opticdev.parsers.{ParserBase, SourceParserManager}
import com.vdurmont.semver4j.Semver
import com.vdurmont.semver4j.Semver.SemverType

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

    val parserOption = {
      val version = parserRef.version
      val availible = (DataDirectory.parsers / parserRef.languageName).list.toSet
      val versionOption = SemverHelper.findVersion(availible, (file: File) => VersionWrapper(file.nameWithoutExtension), version)


      versionOption.map(_._2)
    }

    if (parserOption.isDefined) {
      SourceParserManager.verifyParser(parserOption.get.pathAsString)
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
