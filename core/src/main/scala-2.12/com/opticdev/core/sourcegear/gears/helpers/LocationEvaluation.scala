package com.opticdev.core.sourcegear.gears.helpers

import com.opticdev.sdk.descriptions.Location
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.AstPrimitiveNode

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

import com.opticdev.core.sourcegear.graph.GraphImplicits._

object LocationEvaluation {
  def matches(location: Location, node: AstPrimitiveNode, forParent: AstPrimitiveNode = null)(implicit astGraph: AstGraph) : Boolean = {
    import com.opticdev.sdk.descriptions.enums.LocationEnums._
    location.in match {
      case Anywhere => true
        //@todo shouldn't be true forever
      case InSameFile => true
      case Sibling => node.siblingOf(forParent)
        //@todo impliment scope. don't reinvent the wheel.
      case InScope => false
      case InParent => node.hasParent(forParent)
      case ChildOf(parent) => node.hasParent(parent.resolved)
      case ParentOf(child) => node.hasChild(child.resolved)
    }

  }
}
