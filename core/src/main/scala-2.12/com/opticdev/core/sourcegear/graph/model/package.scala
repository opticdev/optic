package com.opticdev.core.sourcegear.graph

import com.opticdev.core.sourcegear.graph.edges.YieldsModel
import com.opticdev.core.sourcegear.graph.enums.AstPropertyRelationship
import com.opticdev.parsers.graph.CommonAstNode
import com.opticdev.sdk.descriptions.Component
import com.opticdev.sdk.descriptions.enums.{Literal, ObjectLiteral, Token}

package object model {
  type ModelAstMapping = Map[ModelKey, Set[AstMapping]]

  type ModelAstPair = (YieldsModel, CommonAstNode)

  sealed trait ModelKey

  case class Path(path: Seq[String]) extends ModelKey {
    override def toString: String = path.mkString(".")
  }

  object Path {
    def fromString(string: String) = Path(string.split("\\.").toSeq)
  }

  sealed trait AstMapping {
    val relationship : AstPropertyRelationship.Value
    def supportsComponentMapping(component: Component) = {
      component.componentType match {
        case Token if relationship == AstPropertyRelationship.Token => true
        case Literal if relationship == AstPropertyRelationship.Literal => true
        case ObjectLiteral if relationship == AstPropertyRelationship.ObjectLiteral => true
        case _ => false
      }
    }
  }
  case class NodeMapping(node: CommonAstNode, relationship : AstPropertyRelationship.Value) extends AstMapping
  case class ModelVectorMapping(models: Vector[ModelNode]) extends AstMapping {override val relationship = AstPropertyRelationship.Model}
  case class ContainerMapping(containerRoot: CommonAstNode) extends AstMapping {override val relationship = AstPropertyRelationship.NoRelationship}
  case object NoMapping extends AstMapping {override val relationship = AstPropertyRelationship.NoRelationship}
}
