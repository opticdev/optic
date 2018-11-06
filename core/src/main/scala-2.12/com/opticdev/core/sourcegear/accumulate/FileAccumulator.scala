package com.opticdev.core.sourcegear.accumulate

import com.opticdev.common.SchemaRef
import com.opticdev.parsers.AstGraph
import com.opticdev.core.sourcegear.gears.parsing.ParseResult
import com.opticdev.core.sourcegear.graph.GraphOperations
import com.opticdev.parsers.graph.CommonAstNode

case class FileAccumulator(listeners: Map[SchemaRef, Set[Listener]] = Map()) extends Accumulator {
  override def run(implicit astGraph: AstGraph, parseResults: Vector[ParseResult[CommonAstNode]]): Unit = {
    //after this graph will contain all Model Nodes from the file.
    GraphOperations.addModelsToGraph(parseResults)
//
//    val bySchemaId = parseResults.map(_.modelNode.flatten).groupBy(_.schemaId)
//
//    bySchemaId.foreach {
//      case (schemaId, modelNodes)=> {
//        val listenerOption = listeners.get(schemaId)
//        if (listenerOption.isDefined) {
//          val listenersForSchema = listenerOption.get
//          listenersForSchema.foreach(_.collect())
//        }
//      }
//    }
//
  }

}

//class ProjectAccumulator(dir: File) extends Accumulator