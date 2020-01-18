package com.useoptic.changelog

import com.useoptic.changelog.Changelog.{AddedResponse, Change, ChangedContentType, UnhandledDiff}
import com.useoptic.contexts.shapes.ShapesState
import com.useoptic.diff.RequestDiffer.{RequestDiffResult, UnmatchedHttpMethod, UnmatchedHttpStatusCode, UnmatchedRequestBodyShape, UnmatchedRequestContentType, UnmatchedResponseBodyShape, UnmatchedResponseContentType}
import com.useoptic.diff.ShapeDiffer.ShapeDiffResult
import com.useoptic.diff.{ApiInteraction, ApiInteractionLike, RequestDiffer, RequestLike, ResponseLike, ShapeLike}

object CalculateRequestChangelog {

  //also add 'removed'
  def requestDiff(historical: RequestChangeHelper, head: RequestChangeHelper)(implicit changelogInput: ChangelogInput): Vector[Change] = {

    head.allStatusCodes.toVector.sorted.flatMap( simulatedStatusCode => {
      implicit val shapesState = changelogInput.headState.shapesState
      val (targetResponseId, targetResponse) = head.responses.find(_._2.statusCode == simulatedStatusCode).get

      val simulatedInteraction = new ApiInteractionLike {
        override def request: RequestLike = new RequestLike {
          override def url: String = ??? // simulated
          override def method: String = head.method
          override def contentType: String = head.bodyContentType
          override def bodyShape: ShapeLike = head.bodyShape
          //@todo implement a way to diff the query shape directly. for now query params won't show in changelog
          override def queryString: String = ""
        }
        override def response: ResponseLike = new ResponseLike {
          override def statusCode: Int = targetResponse.statusCode
          override def contentType: String = targetResponse.bodyContentType
          override def bodyShape: ShapeLike = targetResponse.bodyShape
        }
        override def asApiInteraction: ApiInteraction = null // simulated
      }

      val requestDiff = RequestDiffer.requestDiff(simulatedInteraction, changelogInput.historicalState, head.pathId).results.toVector
        .map(i => diffToChangelog(i, InRequest(head.requestId)))
      val responseDiff = RequestDiffer.responseDiff(simulatedInteraction, changelogInput.historicalState, head.requestId).results.toVector
        .map(i => diffToChangelog(i, InResponse(targetResponseId, targetResponse.statusCode)))

      (requestDiff ++ responseDiff).distinct
    })
  }

  private def diffToChangelog(rd: RequestDiffResult, context: ChangelogContext)(implicit changelogInput: ChangelogInput): Change = rd match {

    case UnmatchedHttpStatusCode(_, statusCode, _) => AddedResponse(statusCode, context)

    case UnmatchedRequestContentType(_, to, from) => ChangedContentType(from, to, context)
    case UnmatchedResponseContentType(_, to, from, _) => ChangedContentType(from, to, context)

    case UnmatchedRequestBodyShape(_, _, shapeDiff) =>
      CalculateShapeChangelog.diffToShapeChangeLog(shapeDiff, context)
    case UnmatchedResponseBodyShape(_, _, _, shapeDiff) =>
      CalculateShapeChangelog.diffToShapeChangeLog(shapeDiff, context)


    case _ => UnhandledDiff(rd.toString, context)
  }

}
