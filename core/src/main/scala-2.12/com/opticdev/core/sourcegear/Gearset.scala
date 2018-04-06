package com.opticdev.core.sourcegear
import com.opticdev.core.sourcegear.accumulate.FileAccumulator
import com.opticdev.core.sourcegear.gears.parsing.ParseAsModel
import com.opticdev.core.sourcegear.graph.model.ModelNode
import com.opticdev.core.sourcegear.project.{OpticProject, Project, ProjectBase}
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.{AstType, CommonAstNode}

//@todo make this class immutable
class LensSet(initialGears: CompiledLens*) {

  private val gears = scala.collection.mutable.Set[CompiledLens](initialGears:_*)

  var fileAccumulator = FileAccumulator()

  def size = gears.size

  def addGear(gear: CompiledLens) = {
    gears add gear
    reindex
  }

  def addGears(newGears: CompiledLens*) = {
    gears ++= newGears
    reindex
  }

  def removeGear(gear: CompiledLens) = {
    gears remove gear
    reindex
  }

  def listGears = gears.toSet

  private var groupedStore : Map[AstType, Set[CompiledLens]] = Map()

  private def reindex = synchronized {
    val allListeners = gears.flatMap(_.parser.listeners)

    val allEntryNodes = gears.flatMap(_.enterOn).toSet

    groupedStore = allEntryNodes
      .map(nodeType=> (nodeType, gears.filter(_.enterOn.contains(nodeType)).toSet))
      .toMap

    fileAccumulator = FileAccumulator(allListeners.toSet.groupBy(_.mapToSchema))
  }

  def grouped: Map[AstType, Set[CompiledLens]] = groupedStore

  def parseFromGraph(implicit fileContents: String, astGraph: AstGraph, sourceGearContext: SGContext, project: ProjectBase): FileParseResults = {
    val groupedByType = astGraph.nodes.filter(_.isAstNode()).groupBy(_.value.asInstanceOf[CommonAstNode].nodeType)

    //@todo optimize this
    val results = grouped.flatMap { case (nodeType, gears) => {
      val foundOption = groupedByType.get(nodeType)
      if (foundOption.isDefined) {
        val entryNodeVector = foundOption.get
        gears.flatMap(gear =>
          entryNodeVector
            .map(node => {
              gear.parser.matches(node.value.asInstanceOf[CommonAstNode], true).orNull
            })
            .filterNot(_ == null)
        )
      } else Vector()
    }
    }.toVector

    fileAccumulator.run(astGraph, results)


    import com.opticdev.core.sourcegear.graph.GraphImplicits._
    FileParseResults(astGraph, astGraph.modelNodes.asInstanceOf[Vector[ModelNode]], sourceGearContext.parser, sourceGearContext.fileContents)
  }


  //init code
  reindex

}
