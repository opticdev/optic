package com.seamless.serialization
import com.seamless.contexts.data_types.Events.DataTypesEvent
import com.seamless.contexts.requests.Events.RequestsEvent
import com.seamless.contexts.rfc.Events.{ContributionEvent, RfcEvent}
import io.circe.Decoder.Result
import io.circe._
import io.circe.generic.auto._
import io.circe.parser._
import io.circe.syntax._

import scala.util.Try

object EventSerialization {
  def toJson(vector: Vector[RfcEvent]): Json = {
    vector.map {
      case dataTypesEvent: DataTypesEvent => dataTypesEvent.asJson
      case requestEvent: RequestsEvent =>requestEvent.asJson
      case contributionEvent: ContributionEvent =>contributionEvent.asJson
      case _ => throw new java.lang.Error("Unhandled Event Type")
    }.asJson
  }


  private def decodeDataTypesEvent(item: Json): Result[DataTypesEvent] = item.as[DataTypesEvent]
  private def decodeRequestEvent(item: Json): Result[RequestsEvent] = item.as[RequestsEvent]
  private def decodeContributionEvent(item: Json): Result[ContributionEvent] = item.as[ContributionEvent]

  def fromJson(json: Json): Try[Vector[RfcEvent]] = Try {
    println(json)

    val parseResults = json.asArray.get.map {
      case i =>  TryChainUtil.firstSuccessIn(i,
        (j: Json) => Try(decodeDataTypesEvent(j).right.get),
        (j: Json) => Try(decodeRequestEvent(j).right.get),
        (j: Json) => Try(decodeContributionEvent(j).right.get))
    }
    require(parseResults.forall(_.isDefined), "Some events could not be decoded")
    parseResults.collect{ case i if i.isDefined => i.get }
  }

}
