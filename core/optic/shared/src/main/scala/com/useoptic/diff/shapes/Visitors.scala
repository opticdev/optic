package com.useoptic.diff.shapes

import com.useoptic.contexts.shapes.ShapeEntity
import io.circe.Json

abstract class ObjectVisitor {
  def begin(value: io.circe.JsonObject, bodyTrail: JsonTrail, expected: ResolvedTrail, shapeTrail: ShapeTrail)

  def visit(key: String, value: Json, bodyTrail: JsonTrail, trail: Option[ShapeTrail])

  def end()
}

abstract class ArrayVisitor {
  def begin(value: Vector[Json], bodyTrail: JsonTrail, expected: ShapeEntity)

  def visit(index: Number, value: Json, bodyTrail: JsonTrail, trail: Option[ShapeTrail])

  def end()
}

abstract class PrimitiveVisitor {
  def visit(value: Option[Json], bodyTrail: JsonTrail, trail: Option[ShapeTrail])
}

abstract class EmptyVisitor {
  def visit(trail: Option[ShapeTrail])
}

abstract class Visitors {
  val objectVisitor: ObjectVisitor
  val arrayVisitor: ArrayVisitor
  val primitiveVisitor: PrimitiveVisitor
}