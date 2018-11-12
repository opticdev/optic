package com.opticdev.core.sourcegear.graph

import better.files.File
import com.opticdev.common.graph.{AstGraph, BaseNode, CommonAstNode, CustomEdge}
import com.opticdev.common.SchemaRef
import com.opticdev.core.sourcegear.graph.edges.{Exports, InFile}
import com.opticdev.core.sourcegear.graph.model.{BaseModelNode, FlatModelNode, LinkedModelNode, ModelNode}
import com.opticdev.core.sourcegear.graph.objects.ObjectNode

import scala.collection.mutable
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

import scala.util.Try

object GraphImplicits {

  implicit class AstGraphInstance(graph: AstGraph) {

    def modelNodes: Vector[BaseModelNode] = graph
      .nodes
      .filter(_.value.isInstanceOf[BaseModelNode])
      .map(_.value)
      .toVector
      .asInstanceOf[Vector[BaseModelNode]]

    def root : Option[CommonAstNode] = graph
        .nodes
        .filter(i=> i.value.isAstNode && i.value.asInstanceOf[CommonAstNode].parent(graph).isEmpty)
        .map(_.value.asInstanceOf[CommonAstNode])
        .headOption
  }

  implicit class CommonAstNodeInstance(node: CommonAstNode) {

    def hasParent(parent: CommonAstNode)(implicit astGraph: AstGraph) : Boolean = Try {
      if (parent == null) return false
      val dependencies = node.dependencies(astGraph).filter(_.isAstNode()).asInstanceOf[Set[CommonAstNode]]
      dependencies.contains(parent) || dependencies.exists(i => i.hasParent(parent))
    }.getOrElse(false)

    def hasChild(child: CommonAstNode)(implicit astGraph: AstGraph) : Boolean = Try {
      if (child == null) return false
      val dependents = node.dependents(astGraph).filter(_.isAstNode()).asInstanceOf[Set[CommonAstNode]]
      dependents.contains(child) || dependents.exists(i => i.hasChild(child))
    }.getOrElse(false)

    def siblingOf(otherNode: CommonAstNode)(implicit astGraph: AstGraph): Boolean = Try {
      if (otherNode == null) return false
      otherNode.dependencies == node.dependencies
    }.getOrElse(false)

  }

  implicit class BaseModelNodeInstance(modelNode: BaseModelNode) {
    def astRoot()(implicit astGraph: AstGraph): CommonAstNode = modelNode match {
      case l: LinkedModelNode[CommonAstNode] => l.root
      case m: ModelNode => {
        val dependencies = modelNode.dependencies(astGraph)
        if (dependencies.head.isAstNode()) {
          dependencies.head.asInstanceOf[CommonAstNode]
        } else {
          throw new Error("Unable to find AST Root for Model Node " + modelNode)
        }
      }
    }

  }

  implicit class BaseModelNodes(modelNodes: Vector[BaseModelNode]) {
    def ofType(schemaId: SchemaRef) = modelNodes.filter(_.schemaId == schemaId)
  }

  implicit class BaseNodeImplicits(node: BaseNode) {
    def isModel = node.isInstanceOf[BaseModelNode]
  }

  implicit class ProjectGraphInstance(graph: ProjectGraph) {

    def fileNode(file: File) : Option[FileNode] = {
      val result = graph.nodes.filter(i=> i.isNode && i.value.isInstanceOf[FileNode] && i.value.asInstanceOf[FileNode].filePath == file.pathAsString)
      if (result.nonEmpty) Option(result.head.value.asInstanceOf[FileNode]) else None
    }

    def exportsForFile(file: File): collection.Set[_ <: FoundExport] = {
      fileNode(file)
        .map(fn => graph.edges.collect { case e if e.label.isInstanceOf[Exports] && e.value.from == fn =>
          FoundExport(e.label.asInstanceOf[Exports].as, e.value.to.value.asInstanceOf[BaseModelNode])
        })
        .getOrElse(Set.empty)
    }

    def modelNodes() : Vector[FlatModelNode] = {
      val result = graph.nodes.filter(i=> i.value.isInstanceOf[FlatModelNode]).map(_.value.asInstanceOf[FlatModelNode])
      result.toVector
    }

    def objectNodes() : Vector[ObjectNode] = {
      val result = graph.nodes.filter(i=> i.value.isInstanceOf[ObjectNode]).map(_.value.asInstanceOf[ObjectNode])
      result.toVector
    }

    def fileNodes : Set[FileNode] = {
      graph.nodes.collect {
        case f if f.value.isInstanceOf[FileNode] => f.value.asInstanceOf[FileNode]
      }.toSet
    }

    def allSuccessorsOf(astProjection: AstProjection) : Set[AstProjection] = {
      val diSuccessors = graph.get(astProjection).diSuccessors.map(_.value)
      diSuccessors ++ diSuccessors.flatMap(i=> allSuccessorsOf(i))
    }

    def allPredecessorOf(astProjection: AstProjection) : Set[AstProjection] = {
      val diPredecessor = graph.get(astProjection).diPredecessors.map(_.value)
      diPredecessor ++ diPredecessor.flatMap(i=> allPredecessorOf(i))
    }

  }


}
