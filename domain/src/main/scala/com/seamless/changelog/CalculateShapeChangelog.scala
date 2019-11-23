package com.seamless.changelog

import com.seamless.changelog.Changelog.{Change, PlaceHolder}
import com.seamless.contexts.rfc.RfcState
import com.seamless.contexts.shapes.Commands.ShapeId
import com.seamless.diff.ShapeDiffer.ShapeDiffResult
import com.seamless.diff.{ShapeDiffer, ShapeLike}

import scala.collection.immutable

object CalculateShapeChangelog {

  def changeLogForShape(historicalShapeId: ShapeId, currentShapeId: ShapeId)(implicit changelogInput: ChangelogInput): Seq[Change] = {
    val historical = toShapeLike(historicalShapeId, changelogInput.historicalState)
    val head       = toShapeLike(historicalShapeId, changelogInput.headState)

    val shapeDiff: immutable.Seq[ShapeDiffer.ShapeDiffResult] = ShapeDiffer.diff(historical.asShapeEntityOption.get, head)(changelogInput.historicalState.shapesState).toVector
    shapeDiff.map(diffToShape)
  }

  private def diffToShape(sd: ShapeDiffResult): Change = sd match {
    case _ => PlaceHolder(sd.toString)
  }

  private def toShapeLike(shapeId: ShapeId, rfcState: RfcState): ShapeLike = {
    val shapeOption = rfcState.shapesState.shapes.get(shapeId)
    ShapeLike.fromShapeEntity(shapeOption, rfcState, shapeId)
  }

}
