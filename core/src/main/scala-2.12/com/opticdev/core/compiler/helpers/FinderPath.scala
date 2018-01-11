package com.opticdev.core.compiler.helpers

import com.opticdev.parsers.AstGraph
import com.opticdev.parsers.graph.AstPrimitiveNode
import com.opticdev.parsers.graph.path.WalkablePath

abstract class FinderPath {
  val targetNode: AstPrimitiveNode
  val astGraph : AstGraph
  def fromNode(astPrimitiveNode: AstPrimitiveNode) : Option[WalkablePath]

  def leadsToLiteral : Boolean
  def leadsToToken : Boolean

}