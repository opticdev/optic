package sourcegear.accumulate

import cognitro.parsers.GraphUtils.BaseNode
import sdk.descriptions.SchemaComponent

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

case class AccumulatorListener(schemaComponent: SchemaComponent) {
  def collectAndApply()(implicit graph: Graph[BaseNode, LkDiEdge]) = {
    schemaComponent.schema
  }
}
