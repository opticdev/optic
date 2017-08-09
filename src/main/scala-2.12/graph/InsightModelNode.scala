package graph
import cognitro.parsers.GraphUtils._
import nashorn.scriptobjects.insights.Insight
import play.api.libs.json.{JsNumber, JsObject, JsString, JsValue}
import providers.Provider
import graph.GraphAccessor._
import nashorn.scriptobjects.NodeContext

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

case class InsightModelNode(nodeType: ModelType, private var value: JsValue, insight: Insight, dependencyHash: String)(implicit provider: Provider, implicit val graph: Graph[BaseNode, LkDiEdge]) extends BaseNode with ModelNode {

  override def getValue: JsValue = value

  def updateValue(newValue: JsValue): Boolean = {
    val definition = provider.modelProvider.modelByIdentifier(nodeType)
    if (definition.isDefined) {
      val newInstance = definition.get.instanceOf(newValue)
      //if it was created it was valid

      graph.updateModel(this, newValue)

    } else false

  }

  override def fileNode(alternativeGraph: Graph[BaseNode, LkDiEdge] = graph) : BaseFileNode = {
    super.fileNode(graph)
  }

  def astDependencies = {
    dependencies
      .filter(_.isAstNode())
  }

  def allDependencies = dependencies

  def asJson : JsObject = {
    JsObject(Seq(
      "modelType" -> JsString(nodeType.name),
      "value" -> value,
      "modelDefinition" -> provider.modelProvider.modelByIdentifier(nodeType).get.asJson,
      "hash" -> JsNumber(hashCode)
    ))
  }

  override def toString = nodeType.name +": "+ value

}
