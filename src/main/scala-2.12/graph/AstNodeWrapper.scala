package graph

import cognitro.core.contributions.{ChangeAccumulator, ReplaceString}
import cognitro.parsers.GraphUtils._
import jdk.nashorn.api.scripting.{AbstractJSObject, JSObject, ScriptObjectMirror}
import nashorn.ScriptObjectUtils
import nashorn.scriptobjects.{JsNodeWrapperFactory, NodeContext}
import play.api.libs.json.{JsObject, JsValue}
import io.FileUtils._
import graph.GraphAccessor._

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

case class AstNodeWrapper(override val node: AstPrimitiveNode, changeAccumulator: ChangeAccumulator = new ChangeAccumulator())
                         (implicit val graph: Graph[BaseNode, LkDiEdge]) extends NodeWrapper {

  def nodeType = node.nodeType

  def children : Vector[AstNodeWrapper] = node.getChildren(graph).map(i=> AstNodeWrapper(i._2, changeAccumulator)).toVector
  def childrenWithEdgeType : Vector[(LkDiEdge[Graph[BaseNode, LkDiEdge]#NodeT]#L1, AstNodeWrapper)] = node.getChildren(graph).map(i=> (i._1, AstNodeWrapper(i._2, changeAccumulator)))
  def childrenByEdgeType: Map[String, Vector[AstNodeWrapper]] = {
    val children = childrenWithEdgeType
    val allEdgeTypes = children.map(_._1.asInstanceOf[Child].typ).toSet

    allEdgeTypes.map(edgeType => {
      (edgeType, children.filter(_._1.asInstanceOf[Child].typ == edgeType).map(_._2))
    }).toMap

  }
  def jsWrapper(canWrite: Boolean) : JSObject = JsNodeWrapperFactory.buildNode(this, canWrite)

  def models(expanded: Boolean = true): Set[ModelNodeWrapper] = if (expanded)
    node.modelDependentsExpanded(graph).map(ModelNodeWrapper(_))
      else
    node.modelDependents(graph).map(ModelNodeWrapper(_))

  def modelsOrdered = models(true).toVector.sortBy(_.node.graphDepth(graph))

  def updateValue(newValue: JsValue) = {
    graph.updateModel(node, newValue)
  }

  lazy val context: NodeContext = NodeContext(node.fileNode(graph))

  val extensions = node.getExtensions

  private lazy val relevantFileNode: BaseFileNode = node.fileNode(graph)
  private lazy val relevantFileNodeWrapper: FileNodeWrapper = FileNodeWrapper(relevantFileNode)

  //raw getters & mutators
  def getString = relevantFileNode.getString(node.range)
  def replaceString(newString: String) = changeAccumulator.addContribution(ReplaceString(relevantFileNodeWrapper, node.range, newString))

}