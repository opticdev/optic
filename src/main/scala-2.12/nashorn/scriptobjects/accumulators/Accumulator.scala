package nashorn.scriptobjects.accumulators

import cognitro.core.components.models.ModelInstance
import cognitro.parsers.GraphUtils.{AstPrimitiveNode, BaseNode, ModelNode}
import jdk.nashorn.api.scripting.ScriptObjectMirror
import nashorn.ScriptObjectUtils
import nashorn.scriptobjects.ParserReturn
import nashorn.scriptobjects.insights.{InsightParserReturn, LanguageSupport}
import providers.Provider

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

case class Accumulator(name: String,
                       version: Double,
                       languages: Set[LanguageSupport],
                       collectible: Collectible)
                      (implicit val provider: Provider) {


  def evaluate(implicit graph: Graph[BaseNode, LkDiEdge]) : Set[AccumulatorParserReturn] = {
    val collectibleResponse = collectible.collectibleResponseFromGraph(graph)

    collectibleResponse.map(i=> {
      AccumulatorParserReturn(i.distinctModel, i.dependencies, this)
    })
  }
}

object Accumulator {
  def define(params: ScriptObjectMirror)(implicit provider: Provider) : Accumulator = {

    val name = params.get("name").asInstanceOf[String]
    val version = params.get("version").asInstanceOf[Double]
    val collect = params.get("collect").asInstanceOf[ScriptObjectMirror]

    val collectible = new Collectible(collect)

    Accumulator(
      name,
      version,
      Set(),
      collectible
    )

  }
}

case class AccumulatorParserReturn(model: ModelNode, dependencies: Set[BaseNode], accumulator: Accumulator) extends ParserReturn {
  override def toString = model.nodeType+": "+model.getValue+" from "+accumulator.name
}
