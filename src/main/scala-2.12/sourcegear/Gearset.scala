package sourcegear

import optic.parsers.GraphUtils.{AstPrimitiveNode, AstType, BaseNode}
import sourcegear.accumulate.FileAccumulator
import sourcegear.gears.parsing.ParseResult
import optic.parsers.types.GraphTypes.AstGraph

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

class GearSet(initialGears: Gear*) {

  private val gears = scala.collection.mutable.Set[Gear](initialGears:_*)

  private var fileAccumulator = FileAccumulator()

  def size = gears.size

  def addGear(gear: Gear) = {
    gears add gear
    reindex
  }

  def addGears(newGears: Gear*) = {
    gears ++= newGears
    reindex
  }

  def removeGear(gear: Gear) = {
    gears remove gear
    reindex
  }

  private var groupedStore : Map[AstType, Set[Gear]] = Map()

  private def reindex = synchronized {
    val allListeners = gears.flatMap(_.parser.listeners)

    val allEntryNodes = gears.flatMap(_.enterOn).toSet

    groupedStore = allEntryNodes
      .map(nodeType=> (nodeType, gears.filter(_.enterOn.contains(nodeType)).toSet))
      .toMap

    fileAccumulator = FileAccumulator(allListeners.toSet.groupBy(_.schema))
  }

  def grouped: Map[AstType, Set[Gear]] = groupedStore

  def parseFromGraph(implicit fileContents: String, astGraph: AstGraph): Vector[ParseResult] = {
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
