package sourcegear.accumulate

import cognitro.parsers.GraphUtils.{AstType, BaseNode}

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

class Accumulator {

  private val listeners = scala.collection.mutable.Map[AstType, (Vector[String]) => Unit]()

  def addListener(astType: AstType ,action: (Vector[String])=> Unit) = listeners + (astType -> action)

  def run(graph: Graph[BaseNode, LkDiEdge]): Unit = {

  }

}