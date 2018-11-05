package com.opticdev.sdk.skills_sdk.lens

import com.opticdev.common.SchemaRef
import com.opticdev.parsers.rules.Rule
import com.opticdev.sdk.descriptions.Location
import com.opticdev.sdk.descriptions.enums.LocationEnums
import com.opticdev.sdk.skills_sdk.{AssignmentOperations, OMRange, SetValue}

case class OMLensAssignmentComponent(tokenAt: OMFinder,
                                     keyPath: String,
                                     abstraction: Option[SchemaRef],
                                     operation: AssignmentOperations = SetValue) extends OMLensComponent {

  override def rules: Vector[Rule] = Vector()
  def `type`: OMLensComponentType = NotSupported

}