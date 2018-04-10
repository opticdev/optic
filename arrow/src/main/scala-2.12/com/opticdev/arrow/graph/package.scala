package com.opticdev.arrow

import com.opticdev.arrow.changes.location.AsChildOf
import com.opticdev.core.sourcegear.CompiledLens
import com.opticdev.parsers.graph.BaseNode
import com.opticdev.sdk.descriptions.Schema
import play.api.libs.json._
import scalax.collection.GraphEdge.{EdgeLike, UnDiEdge}
import scalax.collection.edge.LkDiEdge
import scalax.collection.immutable.Graph

package object graph {

  sealed trait SGNode {
    def id: String
  }
  case class SchemaNode(schema: Schema) extends SGNode {
    override def id: String = schema.schemaRef.full
  }
  case class LensNode(gear: CompiledLens) extends SGNode {
    override def id: String = gear.lensRef.full
  }

  type KnowledgeGraph = Graph[SGNode, LkDiEdge]

}
