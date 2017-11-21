package com.opticdev.core.sourcegear

import better.files.File
import com.opticdev.common.PackageRef
import com.opticdev.sdk.descriptions.{Schema, SchemaId}
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.opm.OpticPackage
import com.opticdev.parsers.SourceParserManager
import com.opticdev.parsers.ParserBase
import com.opticdev.core.sourcegear.FileParseResults

import scala.util.{Failure, Success, Try}
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

abstract class SourceGear {

  val parsers: Set[ParserBase]
  val gearSet: GearSet = new GearSet

  val schemas: Set[Schema] = Set()

  def fileAccumulator = gearSet.fileAccumulator

  lazy val validExtensions: Set[String] = parsers.flatMap(_.fileExtensions)

  def parseFile(file: File) (implicit project: Project) : Try[FileParseResults] = {
    Try {
      val fileContents = file.contentAsString
      //@todo connect to parser list
      val parsedOption = SourceParserManager.parseString(fileContents, "Javascript", Option("es6"))
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

}

object SourceGear {
  def default: SourceGear = new SourceGear {
    override val parsers: Set[ParserBase] = Set()
  }
}