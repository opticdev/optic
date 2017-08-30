package sourcegear.accumulate

import better.files.File
import cognitro.parsers.GraphUtils.{AstType, BaseNode, FileNode}
import sourcegear.GearSet
import sourceparsers.SourceParserManager

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

trait Accumulator {

  private val listeners = scala.collection.mutable.Map[AstType, (Vector[String]) => Unit]()

  def reset = listeners.clear()

  def addListener(astType: AstType ,action: (Vector[String])=> Unit) = listeners + (astType -> action)

}

class FileAccumulator(gearSet: GearSet) extends Accumulator {

}

class ProjectAccumulator(dir: File) extends Accumulator