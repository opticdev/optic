package com.opticdev.opm.storage

import java.io.FileNotFoundException

import better.files.File
import com.opticdev.common.PackageRef
import com.opticdev.common.storage.DataDirectory
import com.opticdev.parsers.{ParserBase, ParserRef, SourceParserManager}
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

        val versionFileTuples = (DataDirectory.parsers / parserRef.packageId).list
          .map(i=> ( new Semver(i.nameWithoutExtension, SemverType.NPM), i))


        val matchingVersionsSorted = versionFileTuples.filter(pair=> pair._1.satisfies(version) || version == "latest").toSeq
        .sortWith((a, b)=> {
          a._1.isGreaterThan(b._1)
        })

      matchingVersionsSorted.headOption
    }

    if (parserOption.isDefined) {
      SourceParserManager.verifyParser(parserOption.get._2.pathAsString)
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
