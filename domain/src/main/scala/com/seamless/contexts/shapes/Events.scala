package com.seamless.contexts.shapes

import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.contexts.shapes.Commands._

object Events {

  sealed trait ShapesEvent extends RfcEvent

  case class ShapeDefined(shapeId: ShapeId, assignedShapeId:ShapeId, parameters: ShapeParametersDescriptor, name: String) extends ShapesEvent
  case class ShapeAssigned(shapeId: ShapeId, assignedShapeId: ShapeId) extends ShapesEvent
  case class ShapeNamed(shapeId: ShapeId, name: String) extends ShapesEvent
  case class ShapeRemoved(shapeId: ShapeId) extends ShapesEvent

  case class ShapeParameterAdded(shapeParameterId: ShapeParameterId, shapeId: ShapeId, name: String) extends ShapesEvent
  case class ShapeParameterRemoved(shapeParameterId: ShapeParameterId) extends ShapesEvent
  case class ShapeParameterRenamed(shapeParameterId: ShapeParameterId, name: String) extends ShapesEvent

  case class ShapeParameterBound(bindingId: BindingId, shapeParameterId: ShapeParameterId, shapeId: ShapeId, boundShapeId: ShapeId) extends ShapesEvent

  case class UsageAssigned(usageTrail: UsageTrail, usageDescriptor: ShapeUsageDescriptor) extends ShapesEvent
}
