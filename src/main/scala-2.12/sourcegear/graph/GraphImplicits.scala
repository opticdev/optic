package sourcegear.graph

import cognitro.parsers.GraphUtils.{AstPrimitiveNode, BaseNode}
import sdk.descriptions.SchemaId

import scala.collection.mutable
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

object GraphImplicits {

  implicit class GraphInstance(graph: Graph[BaseNode, LkDiEdge]) {

    def modelNodes: Set[ModelNode] = graph
      .nodes
      .filter(_.value.isInstanceOf[ModelNode])
      .map(_.value)
      .toSet
      .asInstanceOf[Set[ModelNode]]

  }

  implicit class AstPrimitiveNodeInstance(node: AstPrimitiveNode) {

    def hasParent(parent: AstPrimitiveNode)(implicit astGraph: Graph[BaseNode, LkDiEdge]) : Boolean = {
      if (parent == null) return false
      val dependencies = node.dependencies(astGraph).filter(_.isAstNode()).asInstanceOf[Set[AstPrimitiveNode]]
      dependencies.contains(parent) || dependencies.exists(i => i.hasParent(parent))
    }

    def hasChild(child: AstPrimitiveNode)(implicit astGraph: Graph[BaseNode, LkDiEdge]) : Boolean = {
      if (child == null) return false
      val dependents = node.dependents(astGraph).filter(_.isAstNode()).asInstanceOf[Set[AstPrimitiveNode]]
      dependents.contains(child) || dependents.exists(i => i.hasChild(child))
    }

    def siblingOf(otherNode: AstPrimitiveNode)(implicit astGraph: Graph[BaseNode, LkDiEdge]): Boolean = {
      if (otherNode == null) return false
      otherNode.dependencies == node.dependencies
    }

  }

  implicit class ModelNodeInstance(modelNode: ModelNode) {
    def astRoot()(implicit astGraph: Graph[BaseNode, LkDiEdge]): AstPrimitiveNode = {
      val dependencies = modelNode.dependencies(astGraph)
      if (dependencies.head.isAstNode()) {
        dependencies.head.asInstanceOf[AstPrimitiveNode]
      } else {
        null
      }
    }
  }

  implicit class ModelNodes(modelNodes: Set[ModelNode]) {
    def ofType(schemaId: SchemaId) = modelNodes.filter(_.schemaId == schemaId)
  }

}
