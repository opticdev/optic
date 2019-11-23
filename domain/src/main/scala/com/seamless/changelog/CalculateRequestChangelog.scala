package com.seamless.changelog

import com.seamless.changelog.Changelog.{Change, PlaceHolder}
import com.seamless.diff.RequestDiffer.RequestDiffResult
import com.seamless.diff.ShapeDiffer.ShapeDiffResult
import com.seamless.diff.{ApiInteraction, ApiInteractionLike, RequestDiffer, RequestLike, ResponseLike, ShapeLike}

object CalculateRequestChangelog {

  //also add 'removed'
  def requestDiff(historical: RequestChangeHelper, head: RequestChangeHelper)(implicit changelogInput: ChangelogInput): Vector[Change] = {

    head.allStatusCodes.toVector.sorted.flatMap( simulatedStatusCode => {
      val (targetResponseId, targetResponse) = head.responses.find(_._2.statusCode == simulatedStatusCode).get

      val simulatedInteraction = new ApiInteractionLike {
        override def request: RequestLike = new RequestLike {
          override def url: String = ??? // simulated
          override def method: String = head.method
          override def contentType: String = head.bodyContentType
          override def bodyShape: ShapeLike = head.bodyShape
        }
        override def response: ResponseLike = new ResponseLike {
          override def statusCode: Int = targetResponse.statusCode
          override def contentType: String = targetResponse.bodyContentType
          override def bodyShape: ShapeLike = targetResponse.bodyShape
        }
        override def asApiInteraction: ApiInteraction = ??? // simulated
      }

      val requestDiff = RequestDiffer.requestDiff(simulatedInteraction, changelogInput.historicalState, head.pathId).results.toVector
      val responseDiff = RequestDiffer.responseDiff(simulatedInteraction, changelogInput.historicalState, head.requestId).results.toVector
      (requestDiff ++ responseDiff).map(diffToChangelog)
    })
  }

  private def diffToChangelog(rd: RequestDiffResult): Change = rd match {
    case _ => PlaceHolder(rd.toString)
  }

}
