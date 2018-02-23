package com.opticdev.sdk.descriptions.helpers

import com.opticdev.sdk.descriptions.finders.Finder
import com.opticdev.parsers.graph.CommonAstNode

//@todo this shouldn't live here. All compiler code should be in core.

sealed trait CodeLocation {
  val resolved: CommonAstNode
}

case class AstLocation(node: CommonAstNode) extends CodeLocation {
  override val resolved: CommonAstNode = node
}

case class FinderLocation(finder: Finder) extends CodeLocation {
  override lazy val resolved: CommonAstNode = {
    //@todo make this resolve using normal finder routines.
    null
  }
}


