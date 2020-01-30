package com.useoptic.diff.initial

import com.useoptic.contexts.shapes.Commands.ShapeId
import com.useoptic.contexts.shapes.ShapesHelper.{BooleanKind, NullableKind, NumberKind, StringKind}
import com.useoptic.contexts.shapes.ShapesState
import com.useoptic.diff.{ShapeDiffer, ShapeLike}
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
      case (shapeId, entity) if ShapeDiffer.diff(entity, ShapeLike.fromActualJson(Some(x))).isEmpty => shapeId
    }
  }
}
