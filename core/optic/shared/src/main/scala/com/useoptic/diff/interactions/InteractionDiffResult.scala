package com.useoptic.diff.interactions

import com.useoptic.diff.DiffResult
import com.useoptic.diff.shapes.ShapeDiffResult
import com.useoptic.serialization.StableHashable

sealed trait InteractionDiffResult extends StableHashable with DiffResult {
  def interactionTrail: InteractionTrail

  def requestsTrail: RequestSpecTrail

  def shapeDiffResultOption: Option[ShapeDiffResult] = None

  def normalize(): InteractionDiffResult = {
    this match {
      case d: UnmatchedRequestUrl => d
      case d: UnmatchedRequestMethod => d
      case d: UnmatchedRequestBodyContentType => d
      case d: UnmatchedResponseStatusCode => d
      case d: UnmatchedResponseBodyContentType => d
      case d: UnmatchedRequestBodyShape => d.copy(shapeDiffResult = d.shapeDiffResult.withNormalizedJsonTrail)
      case d: UnmatchedResponseBodyShape => d.copy(shapeDiffResult = d.shapeDiffResult.withNormalizedJsonTrail)
    }
  }
}


sealed trait ShapeRelatedDiff extends InteractionDiffResult {
  def shapeDiffResult: ShapeDiffResult

  override def shapeDiffResultOption: Option[ShapeDiffResult] = Some(shapeDiffResult)
}

//Diff Types

case class UnmatchedRequestUrl(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail) extends InteractionDiffResult

case class UnmatchedRequestMethod(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail) extends InteractionDiffResult

case class UnmatchedRequestBodyContentType(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail) extends InteractionDiffResult

case class UnmatchedRequestBodyShape(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail, shapeDiffResult: ShapeDiffResult) extends ShapeRelatedDiff

case class UnmatchedResponseStatusCode(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail) extends InteractionDiffResult

case class UnmatchedResponseBodyContentType(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail) extends InteractionDiffResult

case class UnmatchedResponseBodyShape(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail, shapeDiffResult: ShapeDiffResult) extends ShapeRelatedDiff

