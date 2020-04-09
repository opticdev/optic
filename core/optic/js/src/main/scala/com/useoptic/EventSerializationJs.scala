package com.useoptic

import com.useoptic.contexts.rfc.Events.RfcEvent
import com.useoptic.logging.Logger
import com.useoptic.serialization.EventSerialization

import scala.scalajs.js.annotation.{JSExportAll, JSExportTopLevel}
import scala.util.Try

@JSExportTopLevel("EventSerialization")
@JSExportAll
object EventSerializationJs {
  def fromJsonString(jsonString: String): Seq[RfcEvent] = {
    import io.circe.parser._
    val eventsVector =
      for {
        json <- Try(parse(jsonString).right.get)
        eventsVector <- EventSerialization.fromJson(json)
      } yield eventsVector
    if (eventsVector.isFailure) {
      Logger.log(eventsVector.failed.get)
    }
    require(eventsVector.isSuccess, "failed to parse events")
    eventsVector.get
  }
}
