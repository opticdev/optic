package com.opticdev.core.sourcegear.graph

import com.opticdev.core.sourcegear.gears.parsing.ParseResult
import com.opticdev.core.sourcegear.graph.edges.{ContainerRoot, YieldsModel, YieldsProperty}
import com.opticdev.core.sourcegear.graph.model._
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.WithinFile
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import scalax.collection.edge.Implicits._

object GraphOperations {
  def addModelsToGraph[T <: WithinFile](parseResults: Vector[ParseResult[T]]) (implicit astGraph: AstGraph) : Unit = {
    parseResults.foreach(result=> addModelToGraph(result))
  }

  def addModelToGraph[T <: WithinFile](parseResult: ParseResult[T]) (implicit astGraph: AstGraph) : Unit = {
    val flatNode = parseResult.modelNode.flatten
    astGraph add (parseResult.astNode ~+#> flatNode) (YieldsModel(parseResult.parseGear, root = true))
    addMappingEdgesToModel(parseResult.modelNode)
  }

  def addMappingEdgesToModel[T <: WithinFile](linkedModelNode: LinkedModelNode[T])(implicit astGraph: AstGraph) = {
    val flatNode = linkedModelNode.flatten

    linkedModelNode.containerMapping.foreach {
      case (name, astNode) => {
        astGraph add (astNode ~+#> flatNode) (ContainerRoot(name))
      }
    }

    linkedModelNode.modelMapping.foreach {
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
