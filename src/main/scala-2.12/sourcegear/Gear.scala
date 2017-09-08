package sourcegear

import optic.parsers.GraphUtils.{AstPrimitiveNode, AstType, BaseNode}
import sourcegear.gears.parsing.{MatchResults, ParseGear}
import sourcegear.gears.{GenerateGear, MutateGear}
import optic.parsers.types.GraphTypes.AstGraph

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

case class Gear(enterOn: Set[AstType], parser : ParseGear, mutator : MutateGear, generater : GenerateGear) {
  def matches(entryNode: AstPrimitiveNode)(implicit graph: AstGraph, fileContents: String) =
    parser.matches(entryNode)
}