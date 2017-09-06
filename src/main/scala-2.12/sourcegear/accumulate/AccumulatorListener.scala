package sourcegear.accumulate

import cognitro.parsers.GraphUtils.BaseNode
import sdk.descriptions.{SchemaComponent, SchemaId}

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

sealed trait Listener {
  def collect()(implicit astGraph: Graph[BaseNode, LkDiEdge])
}

case class MapSchemaListener(schemaComponent: SchemaComponent) extends Listener {
  override def collect()(implicit astGraph: Graph[BaseNode, LkDiEdge]): Unit = {

    println("HERE")

  }
}
