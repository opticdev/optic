package com.useoptic.diff.shapes.resolvers

import com.useoptic.contexts.shapes.Commands._
import com.useoptic.contexts.shapes._
import com.useoptic.diff.shapes._
import com.useoptic.diff.shapes.resolvers.ShapesResolvers._
import scalaz.Memo

class CachingShapesResolvers(resolvers: ShapesResolvers) extends ShapesResolvers {
  val resolveTrailToCoreShape = Memo.mutableHashMapMemo[(ShapeTrail, ParameterBindings), ResolvedTrail] {
    case (a, b) => resolvers.resolveTrailToCoreShape(a, b)
  }(_, _)

  val resolveTrailToCoreShapeFromParent = Memo.mutableHashMapMemo[(ResolvedTrail, Seq[ShapeTrailPathComponent]), ResolvedTrail] {
    case (a, b) => resolvers.resolveTrailToCoreShapeFromParent(a, b)
  }(_, _)

  val flattenChoice = Memo.mutableHashMapMemo[(ShapeTrail, Seq[ShapeTrailPathComponent], ParameterBindings), Seq[ChoiceOutput]] {
    case (a, b, c) => resolvers.flattenChoice(a, b, c)
  }(_, _, _)

  val listTrailChoices = Memo.mutableHashMapMemo[(ShapeTrail, ParameterBindings), Seq[ChoiceOutput]] {
    case (a, b) => resolvers.listTrailChoices(a, b)
  }(_, _)

  val resolveTrailPath = Memo.mutableHashMapMemo[(ResolvedTrail, ShapeTrailPathComponent), ResolvedTrail] {
    case ((a, b)) => resolvers.resolveTrailPath(a, b)
  }(_, _)
  //
  val resolveParameterToShape = Memo.mutableHashMapMemo[(ShapeId, ShapeParameterId, ParameterBindings), Option[ShapeEntity]] {
    case (a, b, c) => resolvers.resolveParameterToShape(a, b, c)
  }(_, _, _)
  //
  val resolveBaseObject = Memo.mutableHashMapMemo[(ShapeId), ShapeEntity] {
    case (a) => resolvers.resolveBaseObject(a)
  }
  //
  val resolveToBaseShapeId = Memo.mutableHashMapMemo[(ShapeId), ShapeId] {
    case (a) => resolvers.resolveToBaseShapeId(a)
  }
  //
  val resolveToBaseShape = Memo.mutableHashMapMemo[(ShapeId), ShapeEntity] {
    case (a) => resolvers.resolveToBaseShape(a)
  }
  //
  val resolveFieldToShapeEntity = Memo.mutableHashMapMemo[(FieldId, ParameterBindings), (FlattenedField, Option[ShapeEntity])] {
    case (a, b) => resolvers.resolveFieldToShapeEntity(a, b)
  }(_, _)
  //
  val resolveFieldToShape = Memo.mutableHashMapMemo[(FieldId, ParameterBindings), (Option[ResolvedTrail])] {
    case ((a, b)) => resolvers.resolveFieldToShape(a, b)
  }(_, _)

  val tryResolveFieldFromKey = Memo.mutableHashMapMemo[(ShapeEntity, String), (Option[FieldId])] {
    case (a, b) => resolvers.tryResolveFieldFromKey(a, b)
  }(_, _)
}
