package com.seamless.contexts.shapes

import com.seamless.contexts.base.BaseCommandContext
import com.seamless.contexts.shapes.Commands._
import com.seamless.contexts.shapes.Events._
import com.seamless.ddd.{Effects, EventSourcedAggregate}

case class ShapesCommandContext() extends BaseCommandContext

object ShapesAggregate extends EventSourcedAggregate[ShapesState, ShapesCommand, ShapesCommandContext, ShapesEvent] {
  override def handleCommand(state: ShapesState): PartialFunction[(ShapesCommandContext, ShapesCommand), Effects[ShapesEvent]] = {
    case (context: ShapesCommandContext, command: ShapesCommand) => {

      implicit val state: ShapesState = state

      command match {

        ////////////////////////////////////////////////////////////////////////////////

        case DefineShape(shapeId, assignedShapeId, parameters, name) => {
          Validators.ensureShapeIdAssignable(shapeId)
          Validators.ensureShapeIdExists(assignedShapeId)
          persist(Events.ShapeDefined(shapeId, assignedShapeId, parameters, name))
        }

        case AssignShape(shapeId, assignedShapeId) => {
          Validators.ensureShapeIdExists(shapeId)
          Validators.ensureShapeIdExists(assignedShapeId)
          persist(Events.ShapeAssigned(shapeId, assignedShapeId))
        }

        case NameShape(shapeId, name) => {
          Validators.ensureShapeIdExists(shapeId)
          persist(Events.ShapeNamed(shapeId, name))
        }

        case RemoveShape(shapeId) => {
          Validators.ensureShapeIdExists(shapeId)
          persist(Events.ShapeRemoved(shapeId))
        }

        ////////////////////////////////////////////////////////////////////////////////

        case AddShapeParameter(shapeParameterId, shapeId, name) => {
          Validators.ensureShapeIdExists(shapeId)
          Validators.ensureShapeParameterIdAssignable(shapeParameterId)
          Validators.ensureParametersCanBeChanged(shapeId)
          persist(Events.ShapeParameterAdded(shapeParameterId, shapeId, name))
        }

        case RemoveShapeParameter(shapeParameterId) => {
          Validators.ensureShapeParameterIdExists(shapeParameterId)
          Validators.ensureParameterCanBeRemoved(shapeParameterId)
          persist(Events.ShapeParameterRemoved(shapeParameterId))
        }

        case RenameShapeParameter(shapeParameterId, name) => {
          Validators.ensureShapeParameterIdExists(shapeParameterId)
          persist(Events.ShapeParameterRenamed(shapeParameterId, name))
        }

        ////////////////////////////////////////////////////////////////////////////////

        case BindShapeParameter(bindingId, shapeParameterId, shapeId, boundShapeId) => {
          Validators.ensureBindingIdAssignable(bindingId)
          Validators.ensureShapeIdExists(shapeId)
          Validators.ensureShapeIdExists(boundShapeId)
          persist(Events.ShapeParameterBound(bindingId, shapeParameterId, shapeId, boundShapeId))
        }

        case AssignUsage(usageTrail, usageDescriptor) => {
          Validators.ensureUsageTrailIsValid(usageTrail)
          persist(Events.UsageAssigned(usageTrail, usageDescriptor))
        }

      }
    }
  }

  override def applyEvent(event: ShapesEvent, state: ShapesState): ShapesState = {
    event match {

      ////////////////////////////////////////////////////////////////////////////////

      case ShapeDefined(shapeId, assignedShapeId, parameters, name) => {
        state.withShape(shapeId, assignedShapeId, parameters, name)
      }

      case ShapeNamed(shapeId, name) => {
        state.withShapeName(shapeId, name)
      }

      case ShapeAssigned(shapeId, assignedShapeId) => {
        state.withBaseShape(shapeId, assignedShapeId)
      }

      case ShapeRemoved(shapeId) => {
        state.withoutShape(shapeId)
      }

      ////////////////////////////////////////////////////////////////////////////////

      case ShapeParameterAdded(shapeParameterId, shapeId, name) => {
        state.withShapeParameter(shapeParameterId, shapeId, name)
      }

      case ShapeParameterRenamed(shapeParameterId, name) => {
        state.withShapeParameterName(shapeParameterId, name)
      }

      case ShapeParameterRemoved(shapeParameterId) => {
        state.withoutShapeParameter(shapeParameterId)
      }

      ////////////////////////////////////////////////////////////////////////////////


      case ShapeParameterBound(bindingId, shapeParameterId, shapeId, boundShapeId) => {
        state.withBinding(bindingId, shapeParameterId, shapeId, boundShapeId)
      }

      case UsageAssigned(usageTrail, usageDescriptor) => {
        state.withUsage(usageTrail, usageDescriptor)
      }
    }
  }

  override def initialState: ShapesState = {
    val stringShape = CoreShape("string", Primitive(), "string")
    val booleanShape = CoreShape("boolean", Primitive(), "bool")
    val numberShape = CoreShape("number", Primitive(), "number")

    val listShapeId = "list"
    val listItemParameter = ShapeParameter("listItem", ShapeParameterDescriptor(listShapeId, "T"), isRemoved = false)
    val listShape = CoreShape(listShapeId, StaticParameterList(listItemParameter.shapeParameterId), "List")

    val mapShapeId = "map"
    val mapKeyParameter = ShapeParameter("mapKey", ShapeParameterDescriptor(mapShapeId, "K"), isRemoved = false)
    val mapValueParameter = ShapeParameter("mapValue", ShapeParameterDescriptor(mapShapeId, "V"), isRemoved = false)
    val mapShape = CoreShape(mapShapeId, StaticParameterList(mapKeyParameter.shapeParameterId, mapValueParameter.shapeParameterId), "Map")

    val entityIdentifierShapeId = "identifier"
    val entityIdentifierParameter = ShapeParameter("identifierInner", ShapeParameterDescriptor(entityIdentifierShapeId, "T"), isRemoved = false)
    val entityIdentifierShape = CoreShape(entityIdentifierShapeId, StaticParameterList(entityIdentifierParameter.shapeParameterId), "Identifier")

    val entityReferenceShapeId = "reference"
    val entityReferenceParameter = ShapeParameter("referenceInner", ShapeParameterDescriptor(entityReferenceShapeId, "T"), isRemoved = false)
    val entityReferenceShape = CoreShape(entityReferenceShapeId, StaticParameterList(entityReferenceParameter.shapeParameterId), "Identifier")

    val valueObjectShapeId = "valueObject"
    val valueObjectShape = CoreShape(valueObjectShapeId, DynamicParameterList(), "Object")

    val oneOfShapeId = "oneOf"
    val oneOfShape = CoreShape(oneOfShapeId, DynamicParameterList(), "OneOf")

    val shapes = Map(
      stringShape.shapeId -> stringShape,
      numberShape.shapeId -> numberShape,
      booleanShape.shapeId -> booleanShape,
      listShape.shapeId -> listShape,
      mapShape.shapeId -> mapShape,
      entityIdentifierShape.shapeId -> entityIdentifierShape,
      entityReferenceShape.shapeId -> entityReferenceShape,
      valueObjectShape.shapeId -> valueObjectShape,
      oneOfShape.shapeId -> oneOfShape
    )

    val shapeParameters = Map(
      listItemParameter.shapeParameterId -> listItemParameter,
      mapKeyParameter.shapeParameterId -> mapKeyParameter,
      mapValueParameter.shapeParameterId -> mapValueParameter,
      entityIdentifierParameter.shapeParameterId -> entityIdentifierParameter,
      entityReferenceParameter.shapeParameterId -> entityReferenceParameter,
    )

    ShapesState(
      shapes,
      shapeParameters,
      Map.empty,
      Map.empty
    )
  }
}
