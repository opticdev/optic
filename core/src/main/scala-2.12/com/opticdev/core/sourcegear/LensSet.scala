package com.opticdev.core.sourcegear
import better.files.File
import com.opticdev.core.sourcegear.accumulate.FileAccumulator
import com.opticdev.core.sourcegear.annotations.{AnnotationParser, AnnotationSorting, FileNameAnnotation}
import com.opticdev.core.sourcegear.gears.parsing.ParseAsModel
import com.opticdev.core.sourcegear.graph.GraphOperations
import com.opticdev.core.sourcegear.graph.model.{ModelAnnotations, ModelNode, MultiModelNode}
import com.opticdev.core.sourcegear.project.{OpticProject, Project, ProjectBase}
import com.opticdev.core.sourcegear.token_value.FileTokenRegistry
import com.opticdev.common.graph.{AstGraph, AstType, CommonAstNode}
import com.opticdev.core.sourcegear.annotations.dsl.ParseContext
import com.opticdev.core.sourcegear.imports.FileImportsRegistry
import com.opticdev.parsers.imports.ImportModel

import scala.util.Try

//@todo make this class immutable
class LensSet(initialGears: SGExportableLens*) {

  private val lenses = scala.collection.mutable.Set[SGExportableLens]({
    initialGears.collect {
      case single: CompiledLens => Seq(single)
      case multi: CompiledMultiNodeLens => multi.childLenses :+ multi
    }.flatten
  }:_*)

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

  private var multiNodeLensStore : Set[CompiledMultiNodeLens] = Set()

  private def reindex = synchronized {

    val singleLenses: Seq[CompiledLens] = lenses.collect {case cl: CompiledLens => cl}.toSeq

    val allListeners = singleLenses.flatMap(_.parser.listeners)

    val allEntryNodes = lenses.flatMap(_.enterOn).toSet

    groupedStore = allEntryNodes
      .map(nodeType=> (nodeType, singleLenses.filter(_.enterOn.contains(nodeType)).toSet))
      .toMap

    multiNodeLensStore = lenses.collect{case mn: CompiledMultiNodeLens => mn}.toSet

    fileAccumulator = FileAccumulator(allListeners.toSet.groupBy(_.mapToSchema))
  }

  def grouped: Map[AstType, Set[CompiledLens]] = groupedStore

  def parseSingleModelsFromGraph(implicit fileContents: String, astGraph: AstGraph, sourceGearContext: SGContext, project: ProjectBase, fileNameAnnotationOption: Option[FileNameAnnotation]): FileParseResults = {
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

    val modelNodes = astGraph.modelNodes.asInstanceOf[Vector[ModelNode]]

    val importRegistry = {
      val importHandler = sourceGearContext.parser.importHandler
      val internalPackageRef = sourceGearContext.parser.internalSDKPackageRef

      val importModels = modelNodes.collect {
        case mn if mn.schemaId.packageRef.contains(internalPackageRef) && importHandler.internalAbstractions.contains(mn.schemaId.id) =>
          ImportModel(mn.schemaId.id, mn.value)
      }

      val importRecords = Try(importHandler.importsFromModels(importModels.toSet)(sourceGearContext.file, project.projectDirectory)).getOrElse(Set.empty)

      FileImportsRegistry(importRecords)
    }

    val fileAnnotations: Map[ModelNode, Vector[annotations.ObjectAnnotation]] = {
      val parsedAnnotations = AnnotationParser.annotationsFromFile(fileContents)(sourceGearContext.parser, sourceGearContext.file)
      if (parsedAnnotations.nonEmpty) {
        val modelAstPairs = modelNodes.map(i => (i, i.resolveInGraph[CommonAstNode](astGraph)))
        val rangePair = modelAstPairs.map(i => (i._2.root.lineRange(fileContents), i._1.asInstanceOf[ModelNode], i._2.root.range))
        AnnotationSorting.sortAnnotations(rangePair, parsedAnnotations)
      } else Map.empty
    }

    //attach the annotations to the model nodes
    modelNodes.foreach{
      case mn if fileAnnotations.contains(mn) => mn.attachAnnotations(ModelAnnotations.fromVector(fileAnnotations(mn)))
      case _ =>
    }

    FileParseResults(
      astGraph,
      modelNodes,
      sourceGearContext.parser,
      sourceGearContext.fileContents,
      fileNameAnnotationOption,
      FileTokenRegistry.fromModelNodes(modelNodes, astGraph, sourceGearContext.parser),
      importRegistry,
      fileAnnotations
    )
  }

  def parseFromGraph(implicit fileContents: String, astGraph: AstGraph, sourceGearContext: SGContext, project: ProjectBase, fileNameAnnotationOption: Option[FileNameAnnotation]): FileParseResults = {
    val parsed = parseSingleModelsFromGraph(fileContents, astGraph, sourceGearContext, project, fileNameAnnotationOption)

    val results = multiNodeLensStore
      .flatMap(i=> i.parser.findMatches.map(result=> MultiModelNode(result.schema, result.lensRef, result.priority, result.multiNodeParseGear, result.childrenNodes)))

    results.foreach(GraphOperations.addMultiNodeModelToGraph) //add to graph

    parsed.copy(astGraph = astGraph, modelNodes = parsed.modelNodes ++ results)
  }


  //init code
  reindex

}
