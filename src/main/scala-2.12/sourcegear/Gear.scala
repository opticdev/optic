package sourcegear

import cognitro.parsers.GraphUtils.{AstPrimitiveNode, AstType, BaseNode}
import sourcegear.gears.{GenerateGear, MutateGear, ParseGear}

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

abstract class Gear {
  val enterOn : Set[AstType]

  def matches(entryNode: AstPrimitiveNode)(implicit graph: Graph[BaseNode, LkDiEdge], fileContents: String): parser.MatchResults =
    parser.matches(entryNode)

  val parser : ParseGear
  val mutator : MutateGear
  val generater : GenerateGear

}