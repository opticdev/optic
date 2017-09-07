package sourcegear

import optic.parsers.GraphUtils.{AstPrimitiveNode, AstType, BaseNode}
import sourcegear.gears.parsing.{MatchResults, ParseGear}
import sourcegear.gears.{GenerateGear, MutateGear}

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

case class Gear(enterOn: Set[AstType], parser : ParseGear, mutator : MutateGear, generater : GenerateGear) {
  def matches(entryNode: AstPrimitiveNode)(implicit graph: Graph[BaseNode, LkDiEdge], fileContents: String) =
    parser.matches(entryNode)
}