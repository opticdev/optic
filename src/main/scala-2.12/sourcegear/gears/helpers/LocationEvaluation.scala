package sourcegear.gears.helpers

import cognitro.parsers.GraphUtils.{AstPrimitiveNode, BaseNode}
import sdk.descriptions.Location

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import sourcegear.graph.GraphImplicits._

object LocationEvaluation {
  def matches(location: Location, node: AstPrimitiveNode, forParent: AstPrimitiveNode)(implicit astGraph: Graph[BaseNode, LkDiEdge]) : Boolean = {
    import sdk.descriptions.enums.LocationEnums._
    location.in match {
      case Anywhere => true
      case InSameFile => true
      case Sibling => false
      case InScope => false
      case InParent => node.hasParent(forParent)
      case ChildOf(node) => false
      case ParentOf(node) => false
    }

  }
}
