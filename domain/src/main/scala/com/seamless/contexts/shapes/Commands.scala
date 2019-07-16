package com.seamless.contexts.shapes

import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.ddd.ExportedCommand

import scala.scalajs.js.annotation.{JSExportAll, JSExportDescendentClasses}

object Commands {
  type ShapeId = String
  type ShapeParameterId = String
  type BindingId = String
  type FieldId = String

  @JSExportDescendentClasses
  @JSExportAll
  sealed trait ShapesCommand extends RfcCommand with ExportedCommand

  @JSExportDescendentClasses
  @JSExportAll
  sealed trait ShapeParametersDescriptor
  case class NoParameterList() extends ShapeParametersDescriptor
  case class StaticParameterList(shapeParameterIds: Seq[ShapeParameterId]) extends ShapeParametersDescriptor
  case class DynamicParameterList(shapeParameterIds: Seq[ShapeParameterId]) extends ShapeParametersDescriptor

  @JSExportDescendentClasses
  @JSExportAll
  sealed trait FieldShapeDescriptor {
    val fieldId: FieldId
  }
  case class FieldShapeFromShape(fieldId: FieldId, shapeId: ShapeId) extends FieldShapeDescriptor
  case class FieldShapeFromParameter(fieldId: FieldId, shapeParameterId: ShapeParameterId) extends FieldShapeDescriptor

  @JSExportDescendentClasses
  @JSExportAll
  sealed trait ProviderDescriptor
  case class ParameterProvider(shapeParameterId: ShapeParameterId) extends ProviderDescriptor
  case class ShapeProvider(shapeId: ShapeId) extends ProviderDescriptor
  case class NoProvider() extends ProviderDescriptor

  @JSExportDescendentClasses
  @JSExportAll
  sealed trait ParameterShapeDescriptor
  case class ProviderInField(fieldId: FieldId, providerDescriptor: ProviderDescriptor, consumingParameterId: ShapeParameterId) extends ParameterShapeDescriptor
  case class ProviderInShape(shapeId: ShapeId, providerDescriptor: ProviderDescriptor, consumingParameterId: ShapeParameterId) extends ParameterShapeDescriptor

  case class AddShape(shapeId: ShapeId, baseShapeId: ShapeId, name: String) extends ShapesCommand {
    override def toString: String = {
      s"Define a new shape named ${name} that is a ${baseShapeId}, as shape id ${shapeId}"
    }
  }
  case class SetBaseShape(shapeId: ShapeId, baseShapeId: ShapeId) extends ShapesCommand {
    override def toString: String = {
      s"Set ${shapeId} to be a ${baseShapeId}"
    }
  }
  case class RenameShape(shapeId: ShapeId, name: String) extends ShapesCommand
  case class RemoveShape(shapeId: ShapeId) extends ShapesCommand

  case class AddShapeParameter(shapeParameterId: ShapeParameterId, shapeId: ShapeId, name: String) extends ShapesCommand {
    override def toString(): String = {
      s"Add a parameter named ${name} to ${shapeId} as parameter id ${shapeParameterId}. By default, no shape is provided, which will manifest as 'Any'"
    }
  }
  case class RemoveShapeParameter(shapeParameterId: ShapeParameterId) extends ShapesCommand
  case class RenameShapeParameter(shapeParameterId: ShapeParameterId, name: String) extends ShapesCommand

  case class SetParameterShape(shapeDescriptor: ParameterShapeDescriptor) extends ShapesCommand {
    override def toString: String = {
      shapeDescriptor match {
        case p: ProviderInField => {
          s"Set the shape of parameter ${p.consumingParameterId} of field ${p.fieldId} to ${p.providerDescriptor}"
        }
        case p: ProviderInShape => {
          s"Set the shape of parameter ${p.consumingParameterId} of shape ${p.shapeId} to ${p.providerDescriptor}}"
        }
      }
    }
  }

  case class AddField(fieldId: FieldId, shapeId: ShapeId, name: String, shapeDescriptor: FieldShapeDescriptor) extends ShapesCommand {
    override def toString: String = {
      s"Add a field to shape ${shapeId} named ${name} with shape ${shapeDescriptor} as field id ${fieldId}"
    }
  }
  case class RenameField(fieldId: FieldId, name: String) extends ShapesCommand
  case class RemoveField(fieldId: FieldId) extends ShapesCommand

  case class SetFieldShape(shapeDescriptor: FieldShapeDescriptor) extends ShapesCommand {
    override def toString(): String = {
      shapeDescriptor match {
        case s: FieldShapeFromParameter => {
          s"Set the shape of field ${s.fieldId} to the shape of parameter ${s.shapeParameterId}"
        }
        case s: FieldShapeFromShape => {
          s"Set the shape of field ${s.fieldId} to shape ${s.shapeId}"
        }
      }
    }
  }
}