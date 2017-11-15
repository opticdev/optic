package com.opticdev.core.sourcegear.graph

import com.opticdev.core.sourcegear.gears.parsing.ParseResult
import com.opticdev.core.sourcegear.graph.edges.{YieldsModel, YieldsProperty}
import com.opticdev.core.sourcegear.graph.model._
import com.opticdev.parsers.AstGraph

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import scalax.collection.edge.Implicits._

object GraphOperations {
  def addModelsToGraph(parseResults: Vector[ParseResult]) (implicit astGraph: AstGraph) : Unit = {
    parseResults.foreach(result=> addModelToGraph(result))
  }

  def addModelToGraph(parseResult: ParseResult) (implicit astGraph: AstGraph) : Unit = {
    val flatNode = parseResult.modelNode.flatten
    astGraph add (parseResult.astNode ~+#> flatNode) (YieldsModel(parseResult.parseGear))
    addMappingEdgesToModel(parseResult.modelNode)
  }

  def addMappingEdgesToModel(linkedModelNode: LinkedModelNode) (implicit astGraph: AstGraph) = {
    val flatNode = linkedModelNode.flatten
    linkedModelNode.mapping.foreach {
      case (propertyPath, astMapping) =>
        val path = propertyPath.asInstanceOf[Path]
        import com.opticdev.core.sourcegear.graph.enums.AstPropertyRelationship._
        astMapping match {
          case NodeMapping(node, relationship) => astGraph add (node ~+#> flatNode) (YieldsProperty(path, relationship))
          case ModelVectorMapping(models) => models.map(i=> astGraph add (i ~+#> flatNode) (YieldsProperty(path, Model)))
          case _ : Throwable => throw new Error("Unexpected mapping found "+ astMapping)
        }
    }
  }

}
