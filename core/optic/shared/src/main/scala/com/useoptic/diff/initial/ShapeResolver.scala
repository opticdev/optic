package com.useoptic.diff.initial

import com.useoptic.contexts.shapes.Commands.ShapeId
import com.useoptic.contexts.shapes.ShapesHelper.{BooleanKind, NullableKind, NumberKind, StringKind}
import com.useoptic.contexts.shapes.ShapesState
import io.circe.Json

object ShapeResolver {
  def resolveJsonToShapeId(x: Json)(implicit shapesState: ShapesState): Option[ShapeId] = {
    val primitiveOption = handlePrimitive(x)
    if (primitiveOption.isDefined) {
      return primitiveOption
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

}
