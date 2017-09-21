package com.opticdev.core.sdk.descriptions.helpers

import com.opticdev.core.sdk.descriptions.enums.Finders.Finder
import com.opticdev.parsers.graph.AstPrimitiveNode

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


