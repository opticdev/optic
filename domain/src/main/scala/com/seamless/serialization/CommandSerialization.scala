package com.seamless.serialization

import com.seamless.contexts.data_types.Commands.DataTypesCommand
import com.seamless.contexts.data_types.Events.DataTypesEvent
import com.seamless.contexts.requests.Commands.RequestsCommand
import com.seamless.contexts.requests.Events.RequestsEvent
import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.contexts.rfc.Events.RfcEvent
import io.circe.Decoder.Result
import io.circe._
import io.circe.generic.auto._
import io.circe.syntax._

import scala.util.Try

object CommandSerialization {
  def toJson(vector: Vector[RfcCommand]): Json = {
    vector.map {
      case dataTypesCommand: DataTypesCommand => dataTypesCommand.asJson
      case requestCommand: RequestsCommand =>requestCommand.asJson
      case _ => throw new java.lang.Error("Unhandled command Type")
    }.asJson
  }


  private def decodeDataTypesCommand(item: Json): Result[DataTypesCommand] = item.as[DataTypesCommand]
  private def decodeRequestCommand(item: Json): Result[RequestsCommand] = item.as[RequestsCommand]

  def fromJson(json: Json): Try[Vector[RfcCommand]] = Try {
    val parseResults = json.asArray.get.map {
      case i =>  TryChainUtil.firstSuccessIn(i,
        (j: Json) => Try(decodeDataTypesCommand(j).right.get),
        (j: Json) => Try(decodeRequestCommand(j).right.get))
    }
    require(parseResults.forall(_.isDefined), "Some commands could not be decoded")
    parseResults.collect{ case i if i.isDefined => i.get }
  }

}
