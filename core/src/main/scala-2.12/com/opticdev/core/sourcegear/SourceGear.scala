package com.opticdev.core.sourcegear

import better.files.File
import com.opticdev.common.PackageRef
import com.opticdev.sdk.descriptions.{Schema, SchemaRef, Transformation}
import com.opticdev.core.sourcegear.project.{OpticProject, Project}
import com.opticdev.parsers
import com.opticdev.parsers.{ParserBase, ParserRef, SourceParserManager}

import scala.util.{Failure, Success, Try}
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

abstract class SourceGear {

  val parsers: Set[ParserBase]
  val gearSet: GearSet

  val schemas: Set[Schema]

  val transformations: Set[Transformation]

  def fileAccumulator = gearSet.fileAccumulator

  def findSchema(schemaRef: SchemaRef) = schemas.find(_.schemaRef == schemaRef)

  def findGear(id: String) = gearSet.listGears.find(_.id == id)

  def findParser(parserRef: ParserRef) = parsers.find(_.languageName == parserRef.languageName)

  lazy val validExtensions: Set[String] = parsers.flatMap(_.fileExtensions)

  def parseFile(file: File) (implicit project: OpticProject) : Try[FileParseResults] =
    Try(file.contentAsString).flatMap(i=> parseString(i))

  def parseString(string: String) (implicit  project: OpticProject) : Try[FileParseResults] = Try {
    val fileContents = string
    //@todo connect to parser list
    val parsedOption = SourceParserManager.parseString(fileContents, "es7")
    if (parsedOption.isSuccess) {
      val parsed = parsedOption.get
      val astGraph = parsed.graph

      //@todo clean this up and have the parser return in the parse result.
      val parser = parsers.find(_.languageName == parsed.language).get
      implicit val sourceGearContext = SGContext(gearSet.fileAccumulator, astGraph, parser, fileContents)
      gearSet.parseFromGraph(fileContents, astGraph, sourceGearContext, project)
    } else {
      throw parsedOption.failed.get
    }
  }


}

object SourceGear {
  def default: SourceGear = new SourceGear {
    override val parsers: Set[ParserBase] = Set()
    override val gearSet = new GearSet()
    override val schemas = Set()
    override val transformations = Set()
  }
}