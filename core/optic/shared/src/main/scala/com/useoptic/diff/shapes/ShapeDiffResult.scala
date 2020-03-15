package com.useoptic.diff.shapes

import com.useoptic.diff.DiffResult

sealed trait ShapeDiffResult extends DiffResult {
  def jsonTrail: JsonTrail
  def shapeTrail: ShapeTrail
}
// the value at the jsonTrail did not correspond to anything in the spec
case class UnspecifiedShape(jsonTrail: JsonTrail, shapeTrail: ShapeTrail) extends ShapeDiffResult
// the value at the jsonTrail did not match what was expected at the shapeTrail
case class UnmatchedShape(jsonTrail: JsonTrail, shapeTrail: ShapeTrail) extends ShapeDiffResult

