package com.opticdev.core.sourcegear.graph

import com.opticdev.parsers.graph.AstPrimitiveNode

package object model {
  type ModelAstMapping = Map[ModelKey, AstMapping]

  sealed trait ModelKey
  case class Path(path: String) extends ModelKey
  case object RootNode extends ModelKey

  sealed trait AstMapping
  case class Node(node: AstPrimitiveNode) extends AstMapping
  case class NodeVector(nodes: Vector[AstPrimitiveNode]) extends AstMapping
  case object NoMapping extends AstMapping
}
