package com.useoptic.diff.shapes

import com.useoptic.contexts.shapes.ShapeEntity
import com.useoptic.diff.shapes.Resolvers.{ParameterBindings, ResolvedTrail}
import com.useoptic.types.capture.JsonLike

abstract class ObjectVisitor {
  def begin(value: Map[String, JsonLike], bodyTrail: JsonTrail, expected: ResolvedTrail, shapeTrail: ShapeTrail)

  def visit(key: String, jsonLike: JsonLike, bodyTrail: JsonTrail, trail: Option[ShapeTrail], parentBindings: ParameterBindings)

  def end()
}

abstract class ArrayVisitor {
  def begin(value: Vector[JsonLike], bodyTrail: JsonTrail, expected: ShapeEntity)

  def visit(index: Number, value: JsonLike, bodyTrail: JsonTrail, trail: Option[ShapeTrail])

  def end()
}

abstract class PrimitiveVisitor {
  def visit(value: Option[JsonLike], bodyTrail: JsonTrail, trail: Option[ShapeTrail])
}

abstract class EmptyVisitor {
  def visit(trail: Option[ShapeTrail])
}

abstract class JsonLikeVisitors {
  val objectVisitor: ObjectVisitor
  val arrayVisitor: ArrayVisitor
  val primitiveVisitor: PrimitiveVisitor
}
