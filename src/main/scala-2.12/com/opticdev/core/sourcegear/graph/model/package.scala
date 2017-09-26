package com.opticdev.core.sourcegear.graph

import com.opticdev.core.sourcegear.graph.enums.AstPropertyRelationship
import com.opticdev.parsers.graph.AstPrimitiveNode

package object model {
  type ModelAstMapping = Map[ModelKey, AstMapping]

  sealed trait ModelKey
  case class Path(path: String) extends ModelKey

  sealed trait AstMapping {val relationship : AstPropertyRelationship.Value}
  case class NodeMapping(node: AstPrimitiveNode, relationship : AstPropertyRelationship.Value) extends AstMapping
  case class ModelVectorMapping(models: Vector[ModelNode]) extends AstMapping {override val relationship = AstPropertyRelationship.Model}
  case object NoMapping extends AstMapping {override val relationship = AstPropertyRelationship.NoRelationship}
}
