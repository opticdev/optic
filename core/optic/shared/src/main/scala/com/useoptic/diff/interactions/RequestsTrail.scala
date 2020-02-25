package com.useoptic.diff.interactions

import com.useoptic.contexts.requests.Commands.{PathComponentId, RequestId, ResponseId}

sealed trait RequestSpecTrail

case class SpecRoot() extends RequestSpecTrail

case class SpecPath(pathId: PathComponentId) extends RequestSpecTrail

case class SpecRequestRoot(requestId: RequestId) extends RequestSpecTrail

case class SpecRequestBody(requestId: RequestId) extends RequestSpecTrail

case class SpecResponseRoot(responseId: ResponseId) extends RequestSpecTrail

case class SpecResponseBody(responseId: ResponseId) extends RequestSpecTrail

object RequestSpecTrailHelpers {
  def requestId(trail: RequestSpecTrail): Option[RequestId] = {
    trail match {
      case c: SpecRequestRoot => Some(c.requestId)
      case c: SpecRequestBody => Some(c.requestId)
      case _ => None
    }
  }

  def responseId(trail: RequestSpecTrail): Option[RequestId] = {
    trail match {
      case c: SpecResponseRoot => Some(c.responseId)
      case c: SpecResponseBody => Some(c.responseId)
      case _ => None

    }
  }
}