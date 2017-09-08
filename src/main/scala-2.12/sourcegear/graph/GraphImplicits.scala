package sourcegear.graph

import optic.parsers.GraphUtils.{AstPrimitiveNode, BaseNode}
import sdk.descriptions.SchemaId
import optic.parsers.types.GraphTypes.AstGraph

import scala.collection.mutable
import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph

object GraphImplicits {

  implicit class GraphInstance(graph: AstGraph) {

    def modelNodes: Set[ModelNode] = graph
      .nodes
      .filter(_.value.isInstanceOf[ModelNode])
      .map(_.value)
      .toSet
      .asInstanceOf[Set[ModelNode]]

    def root : Option[AstPrimitiveNode] = graph
        .nodes
        .filter(i=> i.value.isAstNode && i.value.asInstanceOf[AstPrimitiveNode].parent(graph).isEmpty)
        .map(_.value.asInstanceOf[AstPrimitiveNode])
        .headOption
  }

  implicit class AstPrimitiveNodeInstance(node: AstPrimitiveNode) {

    def hasParent(parent: AstPrimitiveNode)(implicit astGraph: AstGraph) : Boolean = {
      if (parent == null) return false
      val dependencies = node.dependencies(astGraph).filter(_.isAstNode()).asInstanceOf[Set[AstPrimitiveNode]]
      dependencies.contains(parent) || dependencies.exists(i => i.hasParent(parent))
    }

    def hasChild(child: AstPrimitiveNode)(implicit astGraph: AstGraph) : Boolean = {
      if (child == null) return false
      val dependents = node.dependents(astGraph).filter(_.isAstNode()).asInstanceOf[Set[AstPrimitiveNode]]
      dependents.contains(child) || dependents.exists(i => i.hasChild(child))
    }

    def siblingOf(otherNode: AstPrimitiveNode)(implicit astGraph: AstGraph): Boolean = {
      if (otherNode == null) return false
      otherNode.dependencies == node.dependencies
    }

  }

  implicit class ModelNodeInstance(modelNode: ModelNode) {
    def astRoot()(implicit astGraph: AstGraph): AstPrimitiveNode = {
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
