package com.opticdev.common.graph.path

import com.opticdev.common.graph.{BaseNode, Child, CommonAstNode}
import scalax.collection.GraphPredef.EdgeParam
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

case class WalkablePath(rootNode: CommonAstNode, childPath: Vector[Child], graph: Graph[BaseNode, LkDiEdge]) {

  def walk(startingNode: CommonAstNode = rootNode, useGraph: Graph[BaseNode, LkDiEdge] = graph): CommonAstNode = {

    var currentNode = startingNode
    var none = false

    childPath.foreach(child=> {
      if (!none) {
        val foundNode = currentNode.children(useGraph).find(_._1 == child)
        if (foundNode.isDefined) {
          currentNode = foundNode.get._2
        } else {
          none = true
        }
      }
    })

    if (none) {
      null
    } else {
      currentNode
    }
  }

  override def toString : String = "WalkablePath: "+childPath.toString()

  def toFlatPath = FlatWalkablePath(childPath)

}

case class FlatWalkablePath(path: Vector[Child]= Vector()) {
  def append(child: Child) = FlatWalkablePath(path :+ child)
}

object PathFinder {

  def getPath(graph: Graph[BaseNode, LkDiEdge], n1: CommonAstNode, n2: CommonAstNode) : Option[WalkablePath] = {
    val one = graph.get(n1)
    val two = graph.get(n2)
    //there should be one AND ONLY ONE way to get there so let's use the faster method
    val path = one.pathTo(two)

    if (path.isDefined) {

      val startingPath = path.get.toVector

      val childPath = startingPath.filter(_.isInstanceOf[EdgeParam]).map(item=> {
        val edge = item.asInstanceOf[graph.EdgeT]
        val childLabel = edge.label.asInstanceOf[Child]
        childLabel
      }).toVector

      Option(WalkablePath(n1, childPath, graph))

    } else {
      None
    }
  }

}
