package com.opticdev.arrow

import com.opticdev.core.sourcegear.Gear
import com.opticdev.parsers.graph.BaseNode
import com.opticdev.sdk.descriptions.Schema

import scalax.collection.GraphEdge.{EdgeLike, UnDiEdge}
import scalax.collection.edge.LkDiEdge
import scalax.collection.immutable.Graph

package object graph {

  sealed trait SGNode
  case class SchemaNode(schema: Schema) extends SGNode
  case class GearNode(gear: Gear) extends SGNode

  type KnowledgeGraph = Graph[SGNode, LkDiEdge]

}
