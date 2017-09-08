package sourcegear.graph

import optic.parsers.GraphUtils.BaseNode
import sourcegear.gears.parsing.ParseResult
import optic.parsers.types.GraphTypes.AstGraph

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import scalax.collection.edge.Implicits._

object GraphOperations {
  def addModelsToGraph(parseResults: Vector[ParseResult]) (implicit astGraph: AstGraph) : Unit = {
    parseResults.foreach(result=> {
      astGraph add (result.astNode ~+#> result.modelNode) (YieldsModel(result.parseGear))
    })
  }
}
