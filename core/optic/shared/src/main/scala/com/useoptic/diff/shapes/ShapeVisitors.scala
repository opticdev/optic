package com.useoptic.diff.shapes

import com.useoptic.contexts.shapes.Commands.FieldId
import com.useoptic.contexts.shapes.{FlattenedField, ShapeEntity}
import com.useoptic.diff.shapes.Resolvers.ResolvedTrail
import com.useoptic.types.capture.JsonLike

abstract class ObjectShapeVisitor {
  def begin(objectResolved: ResolvedTrail, shapeTrail: ShapeTrail, exampleJson: Option[JsonLike])
  def visit(key: String, fieldId: FieldId, fieldShapeTrail: ResolvedTrail, fieldTrail: ShapeTrail)
  def end()
}

abstract class ArrayShapeVisitor {
  def begin(value: Vector[JsonLike], bodyTrail: JsonTrail, expected: ShapeEntity)
  def visit(index: Number, value: JsonLike, bodyTrail: JsonTrail, trail: Option[ShapeTrail])
  def end()
}

abstract class PrimitiveShapeVisitor {
  def visit(value: Option[JsonLike], bodyTrail: JsonTrail, trail: Option[ShapeTrail])
}

abstract class EmptyShapeVisitor {
  def visit(trail: Option[ShapeTrail])
}

abstract class ShapeVisitors {
  val objectVisitor: ObjectShapeVisitor
  val arrayVisitor: ArrayShapeVisitor
  val primitiveVisitor: PrimitiveShapeVisitor
}
