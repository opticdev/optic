package sourcegear

import better.files.File
import optic.parsers.ParserBase
import sourcegear.accumulate.FileAccumulator
import sourceparsers.SourceParserManager

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

abstract class SourceGear {
  val parser: Set[ParserBase]
  val gearSet: GearSet = new GearSet

  def parseFile(file: File) = {
    val fileContents = file.contentAsString
    //@todo connect to parser list
    val parsedOption = SourceParserManager.parseString(fileContents, "Javascript", Option("es6"))

    if (parsedOption.isSuccess) {
      val parsed = parsedOption.get
      val astGraph = parsed.graph
      gearSet.parseFromGraph(fileContents, astGraph)
    } else {
      Vector()
    }

  }

}
