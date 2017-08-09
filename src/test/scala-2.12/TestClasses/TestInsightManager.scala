package TestClasses

import cognitro.parsers.GraphUtils.{AstType, NodeType}
import nashorn.scriptobjects.insights.Insight
import providers.InsightProvider

import scala.collection.mutable

object TestInsightManager extends InsightProvider {

  private var insights : Vector[Insight] = Vector()
  private var entryMapStore : Map[AstType, Set[Insight]] = Map()


  def clear = {
    insights = Vector()
    entryMapStore = Map()
  }

  def addInsight(insight: Insight): Unit = {
    insights :+= insight
    rebuildEntryMap()
  }

  def addInsights(is: Insight*) : Unit = {
    insights ++= is.toVector
    rebuildEntryMap()
  }

  def removeInsight(insight: Insight): Unit = {
    insights = insights.filterNot(_ == insight)
  }

  def entryMap: Map[AstType, Set[Insight]] = entryMapStore

  def rebuildEntryMap(): Unit = {

    val output: mutable.HashMap[AstType, Set[Insight]] = scala.collection.mutable.HashMap[AstType, Set[Insight]]()

    insights.foreach(i=> {
                                                      //@todo this is hardcoded. replace it with the insight langadgue set
      i.enterOn.getOrElse(Vector()).map(i=>AstType(i, "Javascript")).foreach(e=> {
        val found = output.get(e)
        if (found.isDefined) {
          val newSet = found.get + i
          output.put(e, newSet)
        } else {
          output.put(e, Set(i))
        }
      })
    })

    entryMapStore = output.toMap

  }

}

