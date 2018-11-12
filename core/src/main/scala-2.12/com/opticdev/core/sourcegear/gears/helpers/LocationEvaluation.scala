package com.opticdev.core.sourcegear.gears.helpers

import com.opticdev.core.sourcegear.containers.{ContainerAstMapping, ContainerMapping}
import com.opticdev.sdk.descriptions.Location
import com.opticdev.common.graph.{AstGraph, CommonAstNode}
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import com.opticdev.core.sourcegear.graph.GraphImplicits._
import com.opticdev.sdk.descriptions.enums.LocationEnums.LocationTypeEnums

object LocationEvaluation {
  def matches(location: Location, node: CommonAstNode, forParent: CommonAstNode = null, containerMapping: ContainerAstMapping = Map())(implicit astGraph: AstGraph) : Boolean = {
    import com.opticdev.sdk.descriptions.enums.LocationEnums._
    location.in match {

      case InCurrentLens => node.hasParent(forParent)
      case InContainer(containerName) => {
        val container = containerMapping.get(containerName)
        if (container.isDefined) {
          node.hasParent(container.get)
        } else {
          false
        }
      }

//should not be invoked in v1
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
