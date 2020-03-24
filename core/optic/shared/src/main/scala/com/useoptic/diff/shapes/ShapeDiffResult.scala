package com.useoptic.diff.shapes

import com.useoptic.diff.DiffResult

sealed trait ShapeDiffResult extends DiffResult {
  def jsonTrail: JsonTrail
  def shapeTrail: ShapeTrail

  def groupingId: Option[String] = {
    val listItemGroupingId = shapeTrail.path.lastOption.collect{ case ListItemTrail(listShapeId, itemShapeId) => s"${listShapeId}_item"}
    //we can make multiple groupings, prioritize them by order in the sequence, then get the first one that is set
    Seq(listItemGroupingId).flatten.headOption
  }

}
// the value at the jsonTrail did not correspond to anything in the spec
case class UnspecifiedShape(jsonTrail: JsonTrail, shapeTrail: ShapeTrail) extends ShapeDiffResult
// the value at the jsonTrail did not match what was expected at the shapeTrail
case class UnmatchedShape(jsonTrail: JsonTrail, shapeTrail: ShapeTrail) extends ShapeDiffResult

