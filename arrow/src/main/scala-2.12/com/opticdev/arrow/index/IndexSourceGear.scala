package com.opticdev.arrow.index

import com.opticdev.arrow.graph
import com.opticdev.arrow.graph.{GearNode, KnowledgeGraph, SchemaNode}
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.sdk.descriptions.Transformation

import scalax.collection.edge.Implicits._
import scala.collection.immutable
import scalax.collection.Graph
import scalax.collection.GraphPredef._
import scalax.collection.GraphEdge._
//schemas <-> lenses undirected edges
//schema -- transformation --> schema
object IndexSourceGear {

  def runFor(sourceGear: SourceGear) : KnowledgeGraph = {

    val gearsBySchemas = sourceGear.gearSet.listGears.groupBy(_.parser.schema)

    val schemaGearNodes: Seq[UnDiEdge[graph.SGNode]] = gearsBySchemas.flatMap {
      case (schemaRef, gears)=> {
        val schemaNode = SchemaNode(sourceGear.findSchema(schemaRef).get)
        gears.map(g=> schemaNode ~ GearNode(g))
      }
    }.toVector

    val transformationNodes = sourceGear.transformations.map {
      case t: Transformation =>
        val inputSchemaNode = SchemaNode(sourceGear.findSchema(t.inputSchema).get)
        val outputSchemaNode = SchemaNode(sourceGear.findSchema(t.outputSchema).get)

        (inputSchemaNode ~+#> outputSchemaNode)(t)
    }.toVector

    Graph((schemaGearNodes ++ transformationNodes):_*).asInstanceOf[KnowledgeGraph]
  }

}
