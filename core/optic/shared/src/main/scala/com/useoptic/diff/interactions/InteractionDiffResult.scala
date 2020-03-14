package com.useoptic.diff.interactions

import com.useoptic.diff.shapes.ShapeDiffResult
import com.useoptic.serialization.StableHashable

sealed trait InteractionDiffResult extends StableHashable
sealed trait ShapeRelatedDiff extends InteractionDiffResult { def shapeDiffResult: ShapeDiffResult }

case class UnmatchedRequestUrl(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail) extends InteractionDiffResult

case class UnmatchedRequestMethod(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail) extends InteractionDiffResult

case class UnmatchedRequestBodyContentType(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail) extends InteractionDiffResult

case class UnmatchedRequestBodyShape(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail, shapeDiffResult: ShapeDiffResult) extends ShapeRelatedDiff

case class UnmatchedResponseStatusCode(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail) extends InteractionDiffResult

case class UnmatchedResponseBodyContentType(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail) extends InteractionDiffResult

case class UnmatchedResponseBodyShape(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail, shapeDiffResult: ShapeDiffResult) extends ShapeRelatedDiff

