package sourcegear

import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.{AstPrimitiveNode, AstType}
import sourcegear.gears.parsing.{MatchResults, ParseGear}
import sourcegear.gears.{GenerateGear, MutateGear}

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

case class Gear(enterOn: Set[AstType], parser : ParseGear, mutator : MutateGear, generater : GenerateGear) {
  def matches(entryNode: AstPrimitiveNode)(implicit graph: AstGraph, fileContents: String) =
    parser.matches(entryNode)
}