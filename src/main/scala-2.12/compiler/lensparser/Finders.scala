package compiler.lensparser

import cognitro.parsers.GraphUtils.Path.PathFinder
import cognitro.parsers.GraphUtils.{AstPrimitiveNode, BaseNode}
import graph.AstNodeWrapper
import jdk.nashorn.api.scripting.{JSObject, ScriptObjectMirror}
import play.api.libs.json.JsObject
import sourceparsers.SourceParserManager

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph
import scala.util.control.Breaks._


sealed trait Finder
case class StringFinder(string: String, occurrence: Int = 0) extends Finder
case class RangeFinder(start: Int, end: Int) extends Finder

sealed trait NodeFinder extends Finder

case class NodeFinderJs(block: ScriptObjectMirror) extends NodeFinder {
  def test(jsNode: JSObject): Boolean = {

    val result = block.call(null, jsNode)

    if (result.isInstanceOf[Boolean]) result.asInstanceOf[Boolean] else false

  }
}
case class NodeFinderScala(block: (AstPrimitiveNode)=> Boolean) extends NodeFinder {
  def test(astPrimitiveNode: AstPrimitiveNode): Boolean = block(astPrimitiveNode)
}


object Finders {

  def string(string: String, occurrence: Int = 0) = StringFinder(string, occurrence)
  def range(first: Int, last: Int) = RangeFinder(first, last)
  def node(block: ScriptObjectMirror) = NodeFinderJs(block)

}

object FinderEvaluator {

  def find(template: String, templateGraph: Graph[BaseNode, LkDiEdge], rootNode: AstPrimitiveNode, finder: Finder) : Option[AstPrimitiveNode] = {
    val all = findAll(template, templateGraph, rootNode, finder)
    if (all.size == 0) None else Option(all.head)
  }

  def findAll(template: String, templateGraph: Graph[BaseNode, LkDiEdge], rootNode: AstPrimitiveNode, finder: Finder) : Vector[AstPrimitiveNode] = {

    def rangeFinder(range: (Int, Int)) : Vector[AstPrimitiveNode] = {
      //find a node with the same range as the search string
      val foundItem = templateGraph.nodes.find((n: templateGraph.NodeT)=> {
        n.value.isAstNode() &&
          n.value.asInstanceOf[AstPrimitiveNode].range == range
      })

      if (foundItem.isDefined) {
        Vector(foundItem.get.value.asInstanceOf[AstPrimitiveNode])
      } else {
        Vector()
      }

    }

    finder match {
      case StringFinder(string, occurrence) => {
        val startIndexOption : Option[Int] = {

          var lastEnd : Int = 0
          var occurrenceStart : Option[Int] = None

          breakable {
            for (x <- 0 to occurrence) {
              val s = template.indexOf(string, lastEnd)
              if (s == -1) break
              lastEnd = s+string.length
              if (x == occurrence) occurrenceStart = Option(s)
            }
          }

          occurrenceStart

        }
        //string found
        if (startIndexOption.isDefined) {
          val startIndex = startIndexOption.get
          val searchRange = (startIndex, startIndex + string.length)

          rangeFinder(searchRange)

        } else {
          Vector()
        }
      }
      case RangeFinder(start, end) => rangeFinder(start, end)
      case nf:NodeFinderJs => {
        implicit val graph = templateGraph

        templateGraph.nodes.toVector.filter(i=> {
          i.value.isAstNode() && {
            val nodeWrapper = AstNodeWrapper(i.value.asInstanceOf[AstPrimitiveNode])
            nf.test(nodeWrapper.jsWrapper(false))
          }
        }).asInstanceOf[Vector[AstPrimitiveNode]]

      }
      case nf:NodeFinderScala => {
        templateGraph.nodes.toVector.filter(i=>
          i.value.isAstNode() &&
          nf.test(i.value.asInstanceOf[AstPrimitiveNode])
        ).asInstanceOf[Vector[AstPrimitiveNode]]
      }
    }
  }

  def findWithPath(template: String, templateGraph: Graph[BaseNode, LkDiEdge], rootNode: AstPrimitiveNode, finder: Finder) = {

    val node = find(template, templateGraph, rootNode, finder)
    if (node.isDefined) {
      val path = PathFinder.getPath(templateGraph, rootNode, node.get)

      (node, path, (templateGraph, rootNode))

    } else null
  }

}
