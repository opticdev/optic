package com.useoptic.diff.shapes

import com.useoptic.contexts.shapes.Commands.{FieldId, ShapeId}
import com.useoptic.contexts.shapes.{FlattenedField, ShapeEntity}
import com.useoptic.diff.shapes.SpecResolvers.ResolvedTrail
import com.useoptic.types.capture.JsonLike

abstract class ObjectShapeVisitor {
  def begin(objectResolved: ResolvedTrail, shapeTrail: ShapeTrail, exampleJson: Option[JsonLike])
  def visit(key: String, fieldId: FieldId, fieldShapeTrail: ResolvedTrail, fieldTrail: ShapeTrail)
  def end()
}

abstract class ListShapeVisitor {
  def begin(shapeTrail: ShapeTrail, listShape: ShapeEntity, itemShape: ShapeEntity)
  def visit()
  def end()
}

abstract class OneOfVisitor {
  def begin(shapeTrail: ShapeTrail, oneOfShape: ShapeEntity, branches: Seq[ShapeId])
  def visit(shapeTrail: ShapeTrail, oneOfShape: ShapeEntity, branchShape: ShapeEntity)
  def end()
}

abstract class GenericWrapperVisitor {
  def begin(shapeTrail: ShapeTrail, shape: ShapeEntity, innerShape: Option[ShapeEntity])
}

abstract class PrimitiveShapeVisitor {
  def visit(resolved: ResolvedTrail, shapeTrail: ShapeTrail)
}

abstract class EmptyShapeVisitor {
  def visit(trail: Option[ShapeTrail])
}

abstract class ShapeVisitors {
  val objectVisitor: ObjectShapeVisitor
  val listVisitor: ListShapeVisitor
  val primitiveVisitor: PrimitiveShapeVisitor
  val oneOfVisitor: OneOfVisitor
  val optionalVisitor: GenericWrapperVisitor
  val nullableVisitor: GenericWrapperVisitor
}
