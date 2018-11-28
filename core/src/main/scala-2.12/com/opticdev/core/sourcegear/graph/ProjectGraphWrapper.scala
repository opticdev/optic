package com.opticdev.core.sourcegear.graph

import better.files.File
import com.opticdev.common.ObjectRef
import com.opticdev.core.sourcegear.annotations.FileNameAnnotation
import com.opticdev.core.sourcegear.graph.edges.{Exports, InFile, YieldsModel}
import com.opticdev.core.sourcegear.graph.model.BaseModelNode
import com.opticdev.core.sourcegear.graph.objects.ObjectNode
import com.opticdev.core.sourcegear.project.{OpticProject, ProjectBase}
import com.opticdev.core.sourcegear.sync.SyncGraph
import com.opticdev.common.graph.{AstGraph, CommonAstNode, CustomEdge, WithinFile}
import com.opticdev.parsers.token_values.External
import com.opticdev.parsers.utils.Crypto
import com.opticdev.sdk.descriptions.PackageExportable

import scala.concurrent.duration._
import scala.util.Try
import scalax.collection.GraphPredef.Param
import scalax.collection.edge.Implicits._
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

import scala.collection.mutable

object ProjectGraphWrapper {
  def empty()(implicit project: ProjectBase) = new ProjectGraphWrapper(Graph[AstProjection, LkDiEdge]())
}

class ProjectGraphWrapper(val projectGraph: ProjectGraph)(implicit val project: ProjectBase) {

  import GraphImplicits._

  def addFile(astGraph: AstGraph, forFile: File, exports: Set[External], fileNameAnnotationOption: Option[FileNameAnnotation] = None) = {
    if (forFile.exists) {
      val newGraph = astGraphToProjectGraph(astGraph, forFile, exports, fileNameAnnotationOption)
      projectGraph ++= newGraph
      checkForUpdatedNamedModelNodes
    }
  }

  def updateFile(astGraph: AstGraph, forFile: File, exports: Set[External], fileNameAnnotationOption: Option[FileNameAnnotation] = None) = {
    if (forFile.exists) {
      removeFile(forFile, ignoreExceptions = true)
      addFile(astGraph, forFile, exports, fileNameAnnotationOption)
    }
  }

  def removeFile(file: File, ignoreExceptions: Boolean = false) = {
    val fileSubgraphOption = subgraphForFile(file)

    val removeFileAttempt = Try {
      val fileSubgraph = fileSubgraphOption.get
      projectGraph --= fileSubgraph
    }

    if (!ignoreExceptions && removeFileAttempt.isFailure) throw removeFileAttempt.failed.get
  }

  def nodeForId(id: String) = projectGraph.nodes.toVector.find(_.value.id == id)

  private def astGraphToProjectGraph(astGraph: AstGraph, forFile: File, exports: Set[External], fileNameAnnotationOption: Option[FileNameAnnotation]): ProjectGraph = {
    val newProjectGraph = Graph[AstProjection, LkDiEdge]()
    val fileNode = FileNode(forFile.pathAsString, fileNameAnnotationOption)(newProjectGraph)
    astGraph.edges.toVector.foreach(edge => {
      val fromNode = edge._1.value
      val toNode = edge._2.value

      if (fromNode.isModel && toNode.isModel) {
        newProjectGraph add (fromNode.asInstanceOf[BaseModelNode] ~+#> toNode.asInstanceOf[BaseModelNode]) (edge.label)
      } else if ( fromNode.isAstNode() && toNode.isModel && edge.label.isInstanceOf[YieldsModel]) {
        newProjectGraph add (fileNode ~+#> toNode.asInstanceOf[BaseModelNode]) (InFile(fromNode.asInstanceOf[WithinFile].range))
      }

      //add exports
      exports.foreach(e => newProjectGraph add(fileNode ~+#> e.model.asInstanceOf[BaseModelNode]) (Exports(e.key)) )

    })
    newProjectGraph
  }

  def subgraphForFile(file: File): Option[ProjectGraph] = {
    val fileNodeOption = projectGraph.fileNode(file)
    if (fileNodeOption.isDefined) {
      val fileNode = fileNodeOption.get
      val subgraphNodes = projectGraph.allSuccessorsOf(fileNode) + fileNode

      val subgraph = projectGraph.filter(projectGraph.having(
        node = (n)=> {
          subgraphNodes.contains(n)
        },
        edge = (e)=> {
          subgraphNodes.contains(e.from.value) && subgraphNodes.contains(e.to.value)
        }
      ))

      Option(subgraph)

    } else None
  }

  def query(nodeFilter: (projectGraph.NodeT) => Boolean): Set[AstProjection] =
    projectGraph.nodes.collect {
      case n: projectGraph.NodeT if nodeFilter(n) => n.value
    }.toSet

  def prettyPrint = {
    //clear it a bit println("\n\n\n")
    import GraphImplicits._
    val files = projectGraph.nodes.filter(_.value.isInstanceOf[FileNode]).toVector.sortBy(_.asInstanceOf[FileNode].filePath)
    files.foreach(file=> {
      val asFileNode = file.value.asInstanceOf[FileNode]
      println(asFileNode+":")
      projectGraph.allSuccessorsOf(asFileNode).foreach(println)
      println()
    })
  }


  //model node gui options management
  private var lastNamedModelNodeStore: Set[NamedModel] = Set()
  private var lastNamedFileNodeStore: Set[NamedFile] = Set()
  def checkForUpdatedNamedModelNodes : Unit = {

    if (!project.hasUpdatedModelNodeOptionsCallbacks) {
      return
    }

    val newNamedModels: Set[NamedModel] = projectGraph.nodes.collect {
      case n if n.value.isModel && n.value.asInstanceOf[BaseModelNode].objectRef.isDefined =>
        val asBaseModelNode = n.value.asInstanceOf[BaseModelNode]
        NamedModel(asBaseModelNode.objectRef.get.name, asBaseModelNode.schemaId.internalFull, asBaseModelNode.id)
      case n if n.value.isObject =>
        val objectNode = n.value.asInstanceOf[ObjectNode]
        NamedModel(objectNode.name, objectNode.schemaRef.internalFull, objectNode.id)
    }.toSet


    val newNamedFiles: Set[NamedFile] = projectGraph.fileNodes.collect {
      case fn if fn.name.isDefined => NamedFile(fn.name.get.name, fn.filePath)
    }

    if (lastNamedModelNodeStore != newNamedModels || lastNamedFileNodeStore != newNamedFiles) {
      lastNamedModelNodeStore = newNamedModels
      lastNamedFileNodeStore = newNamedFiles
      project.callOnUpdatedModelNodeOptions(newNamedModels, newNamedFiles)
    }

  }

  def addProjectSubGraph(subgraphs: ProjectGraph*) = {
    subgraphs.foreach(sg => projectGraph ++= sg)
    checkForUpdatedNamedModelNodes
  }

}