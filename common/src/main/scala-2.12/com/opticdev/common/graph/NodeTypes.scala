package com.opticdev.common.graph

import play.api.libs.json.JsObject
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

import scala.util.hashing.MurmurHash3

trait BaseNode extends Serializable with Product {

  def dependents(implicit graph: Graph[BaseNode, LkDiEdge]): Set[BaseNode] = {
    graph
      .get(this)
      .edges
                            //figure out why this is needed? extra reference somewhere?
      .filter(e=> e.isOut && e.to.value != this)
      .map(_.to.value)
      .toSet
  }

  def dependencies(implicit graph: Graph[BaseNode, LkDiEdge]): Set[BaseNode] = {
    graph
      .get(this)
      .edges
      .filter(e=> e.isOut && e.from.value != this)
      .map(_.from.value)
      .toSet
  }

  def labeledDependents(implicit graph: Graph[BaseNode, LkDiEdge]): Set[(LkDiEdge[Any]#L1, BaseNode)] = {
    graph
      .get(this)
      .edges
      //figure out why this is needed? extra reference somewhere?
      .filter(e=> e.isOut && e.to.value != this)
      .map(i=> {
        (i.label,i.to.value)
      })
      .toSet
  }

  def labeledDependencies(implicit graph: Graph[BaseNode, LkDiEdge]): Set[(LkDiEdge[Any]#L1, BaseNode)] = {
    graph
      .get(this)
      .edges
      .filter(e=> e.isOut && e.from.value != this)
      .map(i=> {
        (i.label, i.from.value)
      })
      .toSet
  }

  def isASTType(nodeType: AstType): Boolean = {
    if (this.isInstanceOf[CommonAstNode]) {
      this.asInstanceOf[CommonAstNode].nodeType == nodeType
    } else {
      false
    }
  }


  def isAstNode(): Boolean = this.isInstanceOf[CommonAstNode]

}

/*

properties:
  nodeType : String, type of primitive node
  range : Tuple[Int, Int], start and stop locations in a given file
  properties : Map[String, Any], a map of all the properties of this node

edges (out):
  produces, models elements created from the file
  child, child AST Node

edges: (in):
  child, other AST node

 */


/*

    graph
      .get(this)
      .edges
      .filter(_.isOut)
      .map(_.to.value)
      .toSet
  }


 */
case class CommonAstNode(nodeType: AstType, range: Range, properties: JsObject, fileHash: String = "SPACE") extends WithinFile {

  def children(implicit graph: Graph[BaseNode, LkDiEdge]) = {
    graph
      .get(this)
      .edges
      .filter(e=> {
        e.isOut && e.to.value != this && e.isLabeled && e.label.asInstanceOf[CustomEdge].isChild
      })
      .toVector
      .sortWith(_.label.asInstanceOf[Child].index < _.label.asInstanceOf[Child].index)
      .map(e=> {
        (e.label, e.to.value.asInstanceOf[CommonAstNode])
      })
  }

  def lineRange(fileContents: String): Range = {
    import com.opticdev.common.utils.RangeToLine._
    range.toLineRange(fileContents)
  }

  def childrenOfType(edgeType: String)(implicit graph: Graph[BaseNode, LkDiEdge]) = {
    graph
      .get(this)
      .edges
      .filter(e=> {
        e.isOut && e.to.value != this && e.isLabeled && e.label.asInstanceOf[CustomEdge].isChild && e.label.asInstanceOf[Child].typ == edgeType
      })
      .toVector
      .sortWith(_.label.asInstanceOf[Child].index < _.label.asInstanceOf[Child].index)
      .map(e=> {
        (e.label, e.to.value.asInstanceOf[CommonAstNode])
      })
  }

  def parent(implicit graph: Graph[BaseNode, LkDiEdge]) =
    dependencies.find(_.isAstNode()).asInstanceOf[Option[CommonAstNode]]

  def parents(implicit graph: Graph[BaseNode, LkDiEdge]): Vector[CommonAstNode] = {
    val p = parent
    if (p.isDefined) p.get.parents :+ p.get else Vector.empty
  }

  def raw(implicit fileContents: String) = fileContents.substring(range.start, range.end)

  override def hash: String = Integer.toHexString(
    MurmurHash3.stringHash(nodeType.toString) ^
    MurmurHash3.stringHash(range.toString()) ^
    MurmurHash3.stringHash(properties.toString()) ^
    MurmurHash3.stringHash(fileHash))
}

trait WithinFile extends BaseNode {

  def range: Range

  def hash: String

  def graphDepth(graph: Graph[BaseNode, LkDiEdge]) : Integer = {

    val rootNode = graph.nodes.filter(_.value.isAstNode()).find(_.value.dependencies(graph).isEmpty)

    val path: Option[graph.Path] = rootNode.get
      .shortestPathTo(graph.get(this))

    if (path.isDefined) {
      path.get.length
    } else null

  }
}