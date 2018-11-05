package com.opticdev.sdk.descriptions.helpers

import com.opticdev.parsers.graph.CommonAstNode
import com.opticdev.sdk.skills_sdk.lens.OMFinder

//@todo this shouldn't live here. All compiler code should be in core.

sealed trait CodeLocation {
  val resolved: CommonAstNode
}

case class AstLocation(node: CommonAstNode) extends CodeLocation {
  override val resolved: CommonAstNode = node
}

case class FinderLocation(finder: OMFinder) extends CodeLocation {
  override lazy val resolved: CommonAstNode = {
    //@todo make this resolve using normal finder routines.
    null
  }
}


