package TestClasses

import cognitro.parsers.GraphUtils.BaseNode
import graph.GraphManager
import nashorn.scriptobjects.ParserReturn
import providers.Provider

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph


class DebuggableGraphManager()(override implicit val provider: Provider) extends GraphManager {

  case class Interpretation(onGraph: Graph[BaseNode, LkDiEdge]) {
    var generations : Vector[Generation] = Vector()
  }
  case class Generation(number: Int, newNodes: Set[BaseNode])

  var interpretations : Vector[Interpretation] = Vector()

  override def interpretGraph(initialSubgraph: Graph[BaseNode, LkDiEdge] = getGraph) = {
    interpretations :+= Interpretation(initialSubgraph)
    super.interpretGraph(initialSubgraph)
  }

  override def reportOut(currentGeneration: Int, newNodes: Set[BaseNode]) = {
    interpretations.head.generations :+= Generation(currentGeneration, newNodes)
    println("Processing Graph at Level "+currentGeneration+". Found "+newNodes.size+" new models.")
  }

}
