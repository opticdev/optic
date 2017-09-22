package com.opticdev.core.sourcegear.graph
import com.opticdev.core.sourcegear.gears.parsing.ParseResult
import com.opticdev.parsers.AstGraph

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import scalax.collection.edge.Implicits._

object GraphOperations {
  def addModelsToGraph(parseResults: Vector[ParseResult]) (implicit astGraph: AstGraph) : Unit = {
    parseResults.foreach(result=> {
      astGraph add (result.astNode ~+#> result.modelNode.flatten) (YieldsModel(result.parseGear))
    })
  }
}
