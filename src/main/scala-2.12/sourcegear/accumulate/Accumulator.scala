package sourcegear.accumulate

import better.files.File
import optic.parsers.GraphUtils.BaseNode
import sdk.descriptions.SchemaId
import sourcegear.GearSet
import sourcegear.gears.parsing.ParseResult
import sourcegear.graph.GraphOperations
import sourceparsers.SourceParserManager

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

trait Accumulator {

  val listeners : Map[SchemaId, Set[Listener]]

  def run(implicit astGraph: Graph[BaseNode, LkDiEdge], parseResults: Vector[ParseResult]) : Unit

}

case class FileAccumulator(listeners: Map[SchemaId, Set[Listener]] = Map()) extends Accumulator {
  override def run(implicit astGraph: Graph[BaseNode, LkDiEdge], parseResults: Vector[ParseResult]): Unit = {
    //after this graph will contain all Model Nodes from the file.
    GraphOperations.addModelsToGraph(parseResults)

    val bySchemaId = parseResults.map(_.modelNode).groupBy(_.schemaId)

    bySchemaId.flatMap {
      case (schemaId, modelNodes)=> {
        val listenerOption = listeners.get(schemaId)
        if (listenerOption.isDefined) {
          val listenersForSchema = listenerOption.get
          listenersForSchema.foreach(_.collect())
          Vector()
        } else Vector()
      }
    }

  }

}

//class ProjectAccumulator(dir: File) extends Accumulator