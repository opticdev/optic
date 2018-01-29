package com.opticdev.arrow

import com.opticdev.core.sourcegear.Gear
import com.opticdev.parsers.graph.BaseNode
import com.opticdev.sdk.descriptions.Schema

import scalax.collection.GraphEdge.{EdgeLike, UnDiEdge}
import scalax.collection.immutable.Graph

package object graph {

  sealed trait SGNode
  case class SchemaNode(schema: Schema) extends SGNode
  case class GearNode(gearNode: Gear) extends SGNode

  type KnowledgeGraph = Graph[SGNode, UnDiEdge]

}
