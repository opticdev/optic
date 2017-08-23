package sourcegear

import cognitro.parsers.GraphUtils.AstType

class Gearset {

  private val gears = scala.collection.mutable.Set[Gear]()

  def addGear(gear: Gear) = gears add gear; reindex
  def removeGear(gear: Gear) = gears remove gear; reindex

  private var groupedStore : Map[AstType, Set[Gear]] = Map()
  private def reindex = {
    val allEntryNodes = gears.flatMap(_.enterOn).toSet

    groupedStore = allEntryNodes
      .map(nodeType=> (nodeType, gears.filter(_.enterOn.contains(nodeType)).toSet))
      .toMap
  }

  def grouped: Map[AstType, Set[Gear]] = groupedStore

}
