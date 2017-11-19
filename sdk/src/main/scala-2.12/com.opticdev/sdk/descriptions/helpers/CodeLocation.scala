package com.opticdev.sdk.descriptions.helpers

import com.opticdev.sdk.descriptions.finders.Finder
import com.opticdev.parsers.graph.AstPrimitiveNode

//@todo this shouldn't live here. All compiler code should be in core.

sealed trait CodeLocation {
  val resolved: AstPrimitiveNode
}

case class AstLocation(node: AstPrimitiveNode) extends CodeLocation {
  override val resolved: AstPrimitiveNode = node
}

case class FinderLocation(finder: Finder) extends CodeLocation {
  override lazy val resolved: AstPrimitiveNode = {
    //@todo make this resolve using normal finder routines.
    null
  }
}


