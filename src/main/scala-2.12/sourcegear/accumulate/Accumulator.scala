package sourcegear.accumulate

import better.files.File
import cognitro.parsers.GraphUtils.{AstType, BaseNode, FileNode}
import sdk.descriptions.SchemaId
import sourcegear.GearSet
import sourcegear.gears.parsing.ParseResult
import sourcegear.graph.GraphOperations
import sourceparsers.SourceParserManager

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

trait Accumulator {

  private val listenersStore = scala.collection.mutable.Map[SchemaId, Set[(String) => Unit]]()

  def reset = listenersStore.clear()

  def listeners = listenersStore

  def addListener(schemaId: SchemaId, action: ((String)=> Unit)) = listenersStore + {
    val listenerSet = listenersStore.getOrElse(schemaId, Set()) + action
    schemaId -> listenerSet
  }

  def run(implicit astGraph: Graph[BaseNode, LkDiEdge], parseResults: Vector[ParseResult]) : Unit

}

class FileAccumulator extends Accumulator {
  override def run(implicit astGraph: Graph[BaseNode, LkDiEdge], parseResults: Vector[ParseResult]): Unit = {
    //after this graph will contain all Model Nodes from the file.
    GraphOperations.addModelsToGraph(parseResults)

    val bySchemaId = parseResults.map(_.modelNode).groupBy(_.schemaId)

    bySchemaId.flatMap {
      case (schemaId, modelNodes)=> {
        val listenerOption = listeners.get(schemaId)
        if (listenerOption.isDefined) {
          val listenersForSchema = listenerOption.get
          listenersForSchema.foreach(i=> i(""))
          Vector()
        } else Vector()
      }
    }

  }
}

//class ProjectAccumulator(dir: File) extends Accumulator