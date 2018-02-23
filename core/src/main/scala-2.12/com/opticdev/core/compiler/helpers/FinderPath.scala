package com.opticdev.core.compiler.helpers

import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.CommonAstNode
import com.opticdev.parsers.graph.path.WalkablePath

abstract class FinderPath {
  val targetNode: CommonAstNode
  val astGraph : AstGraph
  def fromNode(CommonAstNode: CommonAstNode) : Option[WalkablePath]

  def leadsToLiteral : Boolean
  def leadsToToken : Boolean
  def leadsToObjectLiteral : Boolean

}