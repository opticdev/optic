package com.opticdev.core.sourcegear
import com.opticdev.core.sourcegear.accumulate.FileAccumulator
import com.opticdev.core.sourcegear.annotations.FileNameAnnotation
import com.opticdev.core.sourcegear.gears.parsing.ParseAsModel
import com.opticdev.core.sourcegear.graph.model.ModelNode
import com.opticdev.core.sourcegear.project.{OpticProject, Project, ProjectBase}
import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.{AstType, CommonAstNode}

//@todo make this class immutable
class LensSet(initialGears: CompiledLens*) {

  private val lenses = scala.collection.mutable.Set[CompiledLens](initialGears:_*)

  var fileAccumulator = FileAccumulator()

  def size = lenses.size

  def addLens(gear: CompiledLens) = {
    lenses add gear
    reindex
  }

  def addLenses(newGears: CompiledLens*) = {
    lenses ++= newGears
    reindex
  }

  def removeLens(gear: CompiledLens) = {
    lenses remove gear
    reindex
  }

  def listLenses = lenses.toSet

  private var groupedStore : Map[AstType, Set[CompiledLens]] = Map()

  private def reindex = synchronized {
    val allListeners = lenses.flatMap(_.parser.listeners)

    val allEntryNodes = lenses.flatMap(_.enterOn).toSet

    groupedStore = allEntryNodes
      .map(nodeType=> (nodeType, lenses.filter(_.enterOn.contains(nodeType)).toSet))
      .toMap

    fileAccumulator = FileAccumulator(allListeners.toSet.groupBy(_.mapToSchema))
  }

  def grouped: Map[AstType, Set[CompiledLens]] = groupedStore

  def parseFromGraph(implicit fileContents: String, astGraph: AstGraph, sourceGearContext: SGContext, project: ProjectBase, fileNameAnnotationOption: Option[FileNameAnnotation]): FileParseResults = {
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
    FileParseResults(astGraph, astGraph.modelNodes.asInstanceOf[Vector[ModelNode]], sourceGearContext.parser, sourceGearContext.fileContents, fileNameAnnotationOption)
  }

  //init code
  reindex

}
