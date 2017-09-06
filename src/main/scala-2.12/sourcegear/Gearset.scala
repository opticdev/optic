package sourcegear

import cognitro.parsers.GraphUtils.{AstPrimitiveNode, AstType, BaseNode}
import sourcegear.accumulate.FileAccumulator
import sourcegear.gears.parsing.ParseResult

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

class GearSet(initialGears: Gear*) {

  private val gears = scala.collection.mutable.Set[Gear](initialGears:_*)

  private var fileAccumulator = new FileAccumulator

  def addGear(gear: Gear) = {
    gears add gear
    reindex
  }

  def addGears(gears: Gear*) = {
    gears ++ gears
    reindex
  }

  def removeGear(gear: Gear) = {
    gears remove gear
    reindex
  }

  private var groupedStore : Map[AstType, Set[Gear]] = Map()

  //@todo make sure this is used correctly
  private def reindex = synchronized {
    val allEntryNodes = gears.flatMap(_.enterOn).toSet

    groupedStore = allEntryNodes
      .map(nodeType=> (nodeType, gears.filter(_.enterOn.contains(nodeType)).toSet))
      .toMap
  }

  def grouped: Map[AstType, Set[Gear]] = groupedStore

  def parseFromGraph(implicit fileContents: String, astGraph: Graph[BaseNode, LkDiEdge]): Vector[ParseResult] = {
    val groupedByType = astGraph.nodes.filter(_.isAstNode()).groupBy(_.value.asInstanceOf[AstPrimitiveNode].nodeType)

    //@todo optimize this
    val results = grouped.flatMap { case (nodeType, gears) => {
      val foundOption = groupedByType.get(nodeType)
      if (foundOption.isDefined) {
        val entryNodeVector = foundOption.get
        gears.flatMap(gear =>
          entryNodeVector
            .map(node => {
              gear.parser.matches(node.value.asInstanceOf[AstPrimitiveNode], true).orNull
            })
            .filterNot(_ == null)
        )
      } else Vector()
    }
    }.toVector

    fileAccumulator.run(astGraph, results)

    results
  }
}
