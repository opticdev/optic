package com.useoptic.diff.shapes

import com.useoptic.diff.shapes.Resolvers.ResolvedTrail
import com.useoptic.types.capture.JsonLike

abstract class ObjectVisitor {
  def begin(value: Map[String, JsonLike], bodyTrail: JsonTrail, expected: ResolvedTrail, shapeTrail: ShapeTrail)

  def visit(key: String, value: Map[String, JsonLike], bodyTrail: JsonTrail, trail: Option[ShapeTrail])

  def end()
}

abstract class ArrayVisitor {
  def begin(value: Vector[JsonLike], bodyTrail: JsonTrail, shapeTrail: ShapeTrail, resolvedShapeTrail: ResolvedTrail): Unit

  def visit(index: Number, value: JsonLike, bodyTrail: JsonTrail, trail: Option[ShapeTrail])

  def end()
}

abstract class PrimitiveVisitor {
  def visit(value: Option[JsonLike], bodyTrail: JsonTrail, trail: Option[ShapeTrail])
}

abstract class EmptyVisitor {
  def visit(trail: Option[ShapeTrail])
}

abstract class Visitors {
  val objectVisitor: ObjectVisitor
  val arrayVisitor: ArrayVisitor
  val primitiveVisitor: PrimitiveVisitor
}
