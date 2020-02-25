package com.useoptic.diff.interactions

import com.useoptic.diff.shapes.ShapeDiffResult

sealed trait InteractionDiffResult

case class UnmatchedRequestUrl(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail) extends InteractionDiffResult

case class UnmatchedRequestMethod(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail) extends InteractionDiffResult

case class UnmatchedRequestBodyContentType(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail) extends InteractionDiffResult

case class UnmatchedRequestBodyShape(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail, shapeDiffResult: ShapeDiffResult) extends InteractionDiffResult

case class UnmatchedResponseStatusCode(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail) extends InteractionDiffResult

case class UnmatchedResponseBodyContentType(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail) extends InteractionDiffResult

case class UnmatchedResponseBodyShape(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail, shapeDiffResult: ShapeDiffResult) extends InteractionDiffResult

