package com.opticdev.sdk.skills_sdk.lens

import com.opticdev.common.SchemaRef
import com.opticdev.sdk.rules.{Any, Rule}
import com.opticdev.sdk.descriptions.{ChildrenRule, Location, RawRule}
import com.opticdev.sdk.descriptions.enums.LocationEnums
import com.opticdev.sdk.skills_sdk.{AssignmentOperations, OMRange, SetValue}

case class OMLensAssignmentComponent(tokenAt: Option[OMFinder],
                                     keyPath: String,
                                     abstraction: Option[SchemaRef],
                                     operation: AssignmentOperations = SetValue) extends OMLensComponent {

  require(isValid)

  override def capabilities: OpticCapabilities = OpticCapabilities(generate = false, mutate = false, parse = true)
  def `type`: OMLensComponentType = NotSupported
  def fromToken = tokenAt.isDefined
  def fromAbstraction = tokenAt.isEmpty && abstraction.isDefined
  def isValid = fromToken || fromAbstraction


  override def rules: Vector[Rule] = {
    if (fromToken) {
      Vector(RawRule(tokenAt.get, "ANY"), ChildrenRule(tokenAt.get, Any))
    } else Vector()
  }

}