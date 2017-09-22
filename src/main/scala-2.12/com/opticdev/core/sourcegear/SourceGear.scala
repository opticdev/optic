package com.opticdev.core.sourcegear

import better.files.File
import com.opticdev.core.sourceparsers.SourceParserManager
import com.opticdev.parsers.ParserBase

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

abstract class SourceGear {
  val parser: Set[ParserBase]
  val gearSet: GearSet = new GearSet

  def parseFile(file: File) : Option[FileParseResults] = {
    val fileContents = file.contentAsString
    //@todo connect to parser list
    val parsedOption = SourceParserManager.parseString(fileContents, "Javascript", Option("es6"))

    if (parsedOption.isSuccess) {
      val parsed = parsedOption.get
      val astGraph = parsed.graph
      implicit val sourceGearContext = SourceGearContext(gearSet.fileAccumulator, astGraph)
      Option(gearSet.parseFromGraph(fileContents, astGraph, sourceGearContext))
    } else {
      None
    }

  }

}
