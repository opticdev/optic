package com.seamless.contexts.shapes

import com.seamless.contexts.shapes.Commands._

object Validators {
  def ensureBindingIdAssignable(bindingId: BindingId)(implicit state: ShapesState) = {
    require(!state.bindings.contains(bindingId))
  }

  def ensureParameterCanBeRemoved(shapeParameterId: ShapeParameterId)(implicit state: ShapesState) = {
    val parameter = state.shapeParameters(shapeParameterId)
    val shape = state.shapes(parameter.descriptor.shapeId)
    require(shape.isInstanceOf[UserDefinedShape])
  }

  def ensureShapeIdExists(shapeId: ShapeId)(implicit state: ShapesState) = {
    require(state.shapes.contains(shapeId))
  }

  def ensureShapeIdAssignable(shapeId: ShapeId)(implicit state: ShapesState) = {
    require(!state.shapes.contains(shapeId))
  }

  def ensureShapeParameterIdExists(shapeParameterId: ShapeParameterId)(implicit state: ShapesState) = {
    require(state.shapeParameters.contains(shapeParameterId))
  }

  def ensureShapeParameterIdAssignable(shapeParameterId: ShapeParameterId)(implicit state: ShapesState) = {
    require(!state.shapeParameters.contains(shapeParameterId))
  }

  def ensureParametersCanBeChanged(shapeId: ShapeId)(implicit state: ShapesState) = {
    val shape = state.shapes(shapeId)
    require(shape.parameters.isInstanceOf[DynamicParameterList])
  }

  def ensureUsageTrailIsValid(usageTrail: UsageTrail)(implicit state: ShapesState) = {
    // first item in trail must be a UserDefinedShape
    // it may or may not have type parameters
    // if it doesn't, it could reference another Shape
    // if it does, it must be a binding(bindingId, shapeParameterId, shapeId) where shapeId = shapeId OR shapeId = shapeParameter.descriptor.shapeId
    //
    val first = usageTrail.head
    ensureShapeIdExists(first)
  }
}
