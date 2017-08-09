package providers

import cognitro.parsers.GraphUtils.{AstType, NodeType}
import nashorn.scriptobjects.insights.Insight

trait InsightProvider {

  def clear : Unit

  def addInsight(insight: Insight): Unit

  def addInsights(is: Insight*) : Unit

  def removeInsight(insight: Insight): Unit

  def entryMap: Map[AstType, Set[Insight]]

  def rebuildEntryMap(): Unit

}