package com.seamless.serialization
import com.seamless.contexts.requests.Events.RequestsEvent
import com.seamless.contexts.rfc.Events.{ContributionEvent, RfcEvent}
import com.seamless.contexts.shapes.Events.ShapesEvent
import io.circe.Decoder.Result
import io.circe._
import io.circe.generic.auto._
import io.circe.syntax._

import scala.util.Try

object EventSerialization {
  def toJson(vector: Vector[RfcEvent]): Json = {
    vector.map {
      case shapesEvent: ShapesEvent => shapesEvent.asJson
      case requestEvent: RequestsEvent =>requestEvent.asJson
      case contributionEvent: ContributionEvent =>contributionEvent.asJson
      case _ => throw new java.lang.Error("Unhandled Event Type")
    }.asJson
  }


  private def decodeShapesEvent(item: Json): Result[ShapesEvent] = item.as[ShapesEvent]
  private def decodeRequestEvent(item: Json): Result[RequestsEvent] = item.as[RequestsEvent]
  private def decodeContributionEvent(item: Json): Result[ContributionEvent] = item.as[ContributionEvent]

  def fromJson(json: Json): Try[Vector[RfcEvent]] = Try {
    val parseResults = json.asArray.get.map {
      case i =>  TryChainUtil.firstSuccessIn(i,
        (j: Json) => Try(decodeShapesEvent(j).right.get),
        (j: Json) => Try(decodeRequestEvent(j).right.get),
        (j: Json) => Try(decodeContributionEvent(j).right.get))
    }
    require(parseResults.forall(_.isDefined), "Some events could not be decoded")
    parseResults.collect{ case i if i.isDefined => i.get }
  }

}
