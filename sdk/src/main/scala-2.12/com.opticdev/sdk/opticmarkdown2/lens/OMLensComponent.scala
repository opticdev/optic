package com.opticdev.sdk.opticmarkdown2.lens

import com.opticdev.common.SchemaRef
import com.opticdev.parsers.rules.{Any, Rule}
import com.opticdev.sdk.descriptions.enums.FinderEnums.StringEnums
import com.opticdev.sdk.descriptions.{ChildrenRule, Location, RawRule}
import com.opticdev.sdk.descriptions.enums.{BasicComponentType, LocationEnums}
import com.opticdev.sdk.opticmarkdown2.OMRange

trait OMLensComponent {
  def rules: Vector[Rule]
  def `type`: OMLensComponentType
}

case class OMLensCodeComponent(`type`: OMLensComponentType, at: OMFinder) extends OMLensComponent {
    override def rules: Vector[Rule] = Vector(RawRule(at, "ANY"), ChildrenRule(at, Any))
}

sealed trait OMLensComponentType
case object Token extends OMLensComponentType
case object Literal extends OMLensComponentType
case object ObjectLiteral extends OMLensComponentType
case object NotSupported extends OMLensComponentType

sealed trait OMFinder {
  def toDebugString : String
}

case class OMLensNodeFinder(astType: String, range: OMRange) extends OMFinder {
  override def toDebugString: String = s"${astType} at [${range.start}, ${range.end}]"
}

//for debug only
case class OMStringFinder(rule: StringEnums, string: String, occurrence: Int = 0) extends OMFinder {
  def toDebugString : String = s"${rule.toDebugString} ${string} ${if (occurrence!=0) s"[${occurrence}]" else ""}"
}

//for debug only
case class OMRangeFinder(start: Int, end: Int) extends OMFinder {
  def toDebugString : String = s"Node at [${start}, ${end}]"
}

case class OMLensSchemaComponent(schemaRef: SchemaRef,
                                 unique: Boolean = false,
                                 toMap: Option[String] = None, //key property. when defined mapping will be applied to an object keyed by this string
                                 inContainer: Option[String] = None //only will search a container if defined, global if empty
                                ) extends OMLensComponent {
  override def rules: Vector[Rule] = Vector()
  def `type`: OMLensComponentType = NotSupported

  def locationForCompiler: Option[Location] = Some(Location(LocationEnums.InContainer(inContainer.get)))

  def yieldsArray : Boolean = toMap.isEmpty
  def yieldsObject : Boolean = toMap.isDefined

}

case class OMComponentWithPropertyPath[T <: OMLensComponent](propertyPath: Seq[String], component: T) {
  def range: OMRange = component match {
      case f: OMLensNodeFinder => f.range
      case _ => OMRange(0,0)
  }
}