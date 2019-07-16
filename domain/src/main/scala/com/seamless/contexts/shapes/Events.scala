package com.seamless.contexts.shapes

import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.contexts.shapes.Commands._

object Events {

  sealed trait ShapesEvent extends RfcEvent

  case class ShapeAdded(shapeId: ShapeId, baseShapeId: ShapeId, parameters: ShapeParametersDescriptor, name: String) extends ShapesEvent
  case class BaseShapeSet(shapeId: ShapeId, baseShapeId: ShapeId) extends ShapesEvent
  case class ShapeRenamed(shapeId: ShapeId, name: String) extends ShapesEvent
  case class ShapeRemoved(shapeId: ShapeId) extends ShapesEvent

  case class ShapeParameterAdded(shapeParameterId: ShapeParameterId, shapeId: ShapeId, name: String, shapeDescriptor: ParameterShapeDescriptor) extends ShapesEvent
  case class ShapeParameterShapeSet(shapeDescriptor: ParameterShapeDescriptor) extends ShapesEvent
  case class ShapeParameterRenamed(shapeParameterId: ShapeParameterId, name: String) extends ShapesEvent
  case class ShapeParameterRemoved(shapeParameterId: ShapeParameterId) extends ShapesEvent

  case class FieldAdded(fieldId: FieldId, shapeId: ShapeId, name: String, shapeDescriptor: FieldShapeDescriptor) extends ShapesEvent
  case class FieldShapeSet(shapeDescriptor: FieldShapeDescriptor) extends ShapesEvent
  case class FieldRenamed(fieldId: FieldId, name: String) extends ShapesEvent
  case class FieldRemoved(fieldId: FieldId) extends ShapesEvent
}
