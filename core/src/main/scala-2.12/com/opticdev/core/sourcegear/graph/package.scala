package com.opticdev.core.sourcegear

import com.opticdev.parsers.graph.BaseNode

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

package object graph {

  trait AstProjection extends BaseNode {
    val id : String = null
  }
  type ProjectGraph = Graph[AstProjection, LkDiEdge]
  type SyncGraph = ProjectGraph

}
