package com.opticdev.core.compiler.helpers

import com.opticdev.common.graph.{AstGraph, CommonAstNode}
import com.opticdev.common.graph.path.WalkablePath

abstract class FinderPath {
  val targetNode: CommonAstNode
  val astGraph : AstGraph
  def fromNode(CommonAstNode: CommonAstNode) : Option[WalkablePath]

  def leadsToLiteral : Boolean
  def leadsToToken : Boolean
  def leadsToObjectLiteral : Boolean

}