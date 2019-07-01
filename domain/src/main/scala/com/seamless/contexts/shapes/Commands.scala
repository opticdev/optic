package com.seamless.contexts.shapes

import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.ddd.ExportedCommand

object Commands {
  sealed trait ShapesCommand extends RfcCommand with ExportedCommand
  type ShapeId = String
  type ShapeParameterId = String
  type BindingId = String
  type UsageContextId = String
  type UsageTrail = Seq[UsageContextId]

  sealed trait ShapeParametersDescriptor
  case class Primitive() extends ShapeParametersDescriptor
  case class StaticParameterList(shapeParameterId: ShapeParameterId*) extends ShapeParametersDescriptor
  case class DynamicParameterList(shapeParameterId: ShapeParameterId*) extends ShapeParametersDescriptor

  sealed trait ShapeUsageDescriptor
  case class RequiredUsage() extends ShapeUsageDescriptor
  case class OptionalUsage() extends ShapeUsageDescriptor
  case class ExcludedUsage() extends ShapeUsageDescriptor

  case class DefineShape(shapeId: ShapeId, assignedShapeId: ShapeId, parameters: ShapeParametersDescriptor, name: String) extends ShapesCommand
  case class AssignShape(shapeId: ShapeId, assignedShapeId: ShapeId) extends ShapesCommand
  case class NameShape(shapeId: ShapeId, name: String) extends ShapesCommand
  case class RemoveShape(shapeId: ShapeId) extends ShapesCommand

  case class AddShapeParameter(shapeParameterId: ShapeParameterId, shapeId: ShapeId, name: String) extends ShapesCommand
  case class RemoveShapeParameter(shapeParameterId: ShapeParameterId) extends ShapesCommand
  case class RenameShapeParameter(shapeParameterId: ShapeParameterId, name: String) extends ShapesCommand

  case class BindShapeParameter(bindingId: BindingId, shapeParameterId: ShapeParameterId, shapeId: ShapeId, boundShapeId: ShapeId) extends ShapesCommand

  case class AssignUsage(usageTrail: UsageTrail, usageDescriptor: ShapeUsageDescriptor) extends ShapesCommand
}

/*
Projections
- shapes that are referenced in usages
- shapes that have names (Concepts)
- flattened shapes
 */