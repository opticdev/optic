package com.seamless.diff.initial

import com.seamless.contexts.shapes.Commands.ShapeId
import com.seamless.contexts.shapes.ShapesHelper.{BooleanKind, NullableKind, NumberKind, StringKind}
import com.seamless.contexts.shapes.ShapesState
import com.seamless.diff.ShapeDiffer
import com.seamless.diff.ShapeDiffer.NoDiff
import io.circe.Json

object ShapeResolver {
  def resolveJsonToShapeId(x: Json)(implicit shapesState: ShapesState): Option[ShapeId] = {
    val primitiveOption = handlePrimitive(x)
    if (primitiveOption.isDefined) {
      return primitiveOption
    }

    val handleObjectOption = handleObject(x)
    if (handleObjectOption.isDefined) {
      return handleObjectOption
    }

    None
  }

  def handlePrimitive(x: Json)(implicit shapesState: ShapesState): Option[ShapeId] = x match {
    case x if x.isNull => Some(NullableKind.baseShapeId)
    //hook in here to check strings against the set of formatters
    case x if x.isString => Some(StringKind.baseShapeId)
    case x if x.isNumber => Some(NumberKind.baseShapeId)
    case x if x.isBoolean => Some(BooleanKind.baseShapeId)

    case _ => None
  }

  def handleObject(x: Json)(implicit shapesState: ShapesState): Option[ShapeId] = {
    val conceptsWithIds = shapesState.concepts

    conceptsWithIds.collectFirst {
      case (shapeId, entity) if ShapeDiffer.diff(entity, Some(x)) == NoDiff() => shapeId
    }
  }
}
