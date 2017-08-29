package sourcegear

import cognitro.parsers.GraphUtils.{AstPrimitiveNode, AstType, BaseNode}
import sourcegear.gears.parsing.{MatchResults, ParseGear}
import sourcegear.gears.{GenerateGear, MutateGear}

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

abstract class Gear {
  val enterOn : Set[AstType]

  def matches(entryNode: AstPrimitiveNode)(implicit graph: Graph[BaseNode, LkDiEdge], fileContents: String) =
    parser.matches(entryNode)

  val parser : ParseGear
  val mutator : MutateGear
  val generater : GenerateGear

}