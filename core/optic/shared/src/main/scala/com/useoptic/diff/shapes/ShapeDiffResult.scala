package com.useoptic.diff.shapes

sealed trait ShapeDiffResult
// the value at the jsonTrail did not correspond to anything in the spec
case class UnspecifiedShape(jsonTrail: JsonTrail, shapeTrail: ShapeTrail) extends ShapeDiffResult

// the value at the jsonTrail did not match what was expected at the shapeTrail
case class UnmatchedShape(jsonTrail: JsonTrail, shapeTrail: ShapeTrail) extends ShapeDiffResult

