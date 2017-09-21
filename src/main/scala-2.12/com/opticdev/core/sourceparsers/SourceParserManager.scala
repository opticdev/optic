package com.opticdev.core.sourceparsers


import java.io.File
import java.net.URLClassLoader
import java.security.MessageDigest

import com.opticdev.parsers.graph.NodeType
import com.opticdev.parsers.{IdentifierNodeDesc, ParserBase, ParserResult}

import scala.util.{Failure, Try}
import scalax.collection.edge.Implicits._
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

object SourceParserManager {


  private var parsers : Set[ParserBase] = Set()
  //generated one time
  private var parsersNameAndVersions : Map[String, Vector[String]] = null

  private lazy val sha = MessageDigest.getInstance("SHA")

  def hasParserFor(lang: String) : Boolean = getInstalledParsers.exists(_.languageName == lang)

  private def enableParser(instance: ParserBase) : ParserBase = {
    parsers = parsers + instance
    generateSignature()
    instance
  }

  private def generateSignature(): Unit = {
    parsersNameAndVersions = parsers.toVector.sortBy(_.languageName).map(i=> {
      i.languageName -> i.fileExtensions
    }).toMap
  }

  def parserByLanguageName(lang: String): Option[ParserBase] = {
    parsers.find(_.languageName == lang)
  }

  private def disableParser(instance: ParserBase) = {
    parsers = parsers.filterNot(_==instance)
    generateSignature()
  }


  def clearParsers = parsers = Set()

  def getInstalledParsers : Set[ParserBase] = parsers
  def getParserSignatures = parsersNameAndVersions

  def selectParserForFileName(name: String): Option[ParserBase] = {
    //@note does not support multiple things having same patterns
    parsers.find(i=> i.fileExtensions.exists(name.endsWith))
  }

  def programNodeTypeForLanguage(language: String) : Option[NodeType] = {
    val parser = parserByLanguageName(language)
    if (parser.isDefined) {
      Option(parser.get.programNodeType)
    } else {
      None
    }
  }

  def IdentifierNodeTypeForLanguage(language: String) : Option[IdentifierNodeDesc] = {
    val parser = parserByLanguageName(language)
    if (parser.isDefined) {
      Option(parser.get.identifierNodeDesc)
    } else {
      None
    }
  }

  def parseString(contents: String, language: String, versionOverride: Option[String] = None, fileHash: String = "SPACE"): Try[ParserResult] = {
    val parser = parserByLanguageName(language)
    Try(if (parser.isDefined) {
      parser.get.parseString(contents, versionOverride)
    } else throw new Error("No parser found for "+language+" "+versionOverride.toString))
  }

  def installParser(pathToParser: String) : Try[ParserBase] = {
    Try({
      val file = new File(pathToParser)
      if (file.exists() && file.canRead) {
        try {
          val instance = loadJar(file)
          enableParser(instance)
        } catch {
          case e: Exception => {
            println(e)
            throw new Error("Invalid Parser .jar")
          }
        }
      } else {
        throw new Error("Unable to install parser. File not found at " + pathToParser)
      }
    })
  }

  @throws(classOf[Exception])
  private def loadJar(parserJar: File): ParserBase = {
    val child = new URLClassLoader(Array(parserJar.toURL), this.getClass().getClassLoader())
    val classToLoad = child.loadClass("javascript.Parser")
    val instance = classToLoad.newInstance().asInstanceOf[ParserBase]
    instance
  }


}
