package sdk.descriptions.helpers

import cognitro.parsers.GraphUtils.AstPrimitiveNode
import sdk.descriptions.Finders.Finder

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


