package com.opticdev.arrow

import com.opticdev.arrow.changes.location.AsChildOf
import com.opticdev.core.sourcegear.{CompiledLens, SGExportableLens}
import com.opticdev.common.graph.BaseNode
import com.opticdev.sdk.skills_sdk.schema.OMSchema
import play.api.libs.json._
import scalax.collection.GraphEdge.{EdgeLike, UnDiEdge}
import scalax.collection.edge.LkDiEdge
import scalax.collection.immutable.Graph

package object graph {

  sealed trait SGNode {
    def id: String
  }
  case class SchemaNode(schema: OMSchema) extends SGNode {
    override def id: String = schema.schemaRef.full
  }
  case class LensNode(gear: SGExportableLens) extends SGNode {
    override def id: String = gear.lensRef.full
  }

  type KnowledgeGraph = Graph[SGNode, LkDiEdge]

}
