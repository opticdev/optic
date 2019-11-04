package com.seamless.contexts.shapes

import com.seamless.contexts.rfc.Events.{EventContext, RfcEvent}
import com.seamless.contexts.shapes.Commands._

object Events {

  sealed trait ShapesEvent extends RfcEvent

  case class ShapeAdded(shapeId: ShapeId, baseShapeId: ShapeId, parameters: ShapeParametersDescriptor, name: String, eventContext: Option[EventContext] = None) extends ShapesEvent
  case class BaseShapeSet(shapeId: ShapeId, baseShapeId: ShapeId, eventContext: Option[EventContext] = None) extends ShapesEvent
  case class ShapeRenamed(shapeId: ShapeId, name: String, eventContext: Option[EventContext] = None) extends ShapesEvent
  case class ShapeRemoved(shapeId: ShapeId, eventContext: Option[EventContext] = None) extends ShapesEvent

  case class ShapeParameterAdded(shapeParameterId: ShapeParameterId, shapeId: ShapeId, name: String, shapeDescriptor: ParameterShapeDescriptor, eventContext: Option[EventContext] = None) extends ShapesEvent
  case class ShapeParameterShapeSet(shapeDescriptor: ParameterShapeDescriptor, eventContext: Option[EventContext] = None) extends ShapesEvent
  case class ShapeParameterRenamed(shapeParameterId: ShapeParameterId, name: String, eventContext: Option[EventContext] = None) extends ShapesEvent
  case class ShapeParameterRemoved(shapeParameterId: ShapeParameterId, eventContext: Option[EventContext] = None) extends ShapesEvent

  case class FieldAdded(fieldId: FieldId, shapeId: ShapeId, name: String, shapeDescriptor: FieldShapeDescriptor, eventContext: Option[EventContext] = None) extends ShapesEvent
  case class FieldShapeSet(shapeDescriptor: FieldShapeDescriptor, eventContext: Option[EventContext] = None) extends ShapesEvent
  case class FieldRenamed(fieldId: FieldId, name: String, eventContext: Option[EventContext] = None) extends ShapesEvent
  case class FieldRemoved(fieldId: FieldId, eventContext: Option[EventContext] = None) extends ShapesEvent
}
