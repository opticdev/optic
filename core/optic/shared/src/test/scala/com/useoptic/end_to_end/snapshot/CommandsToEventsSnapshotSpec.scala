package com.useoptic.end_to_end.snapshot

import com.useoptic.contexts.rfc.Commands.RfcCommand
import com.useoptic.contexts.rfc.Events.RfcEvent
import com.useoptic.contexts.rfc.{RfcCommandContext, RfcService, RfcServiceJSFacade}
import com.useoptic.end_to_end.fixtures.SnapShotDriverFixture
import com.useoptic.serialization.{CommandSerialization, EventSerialization}
import io.circe.{Decoder, Encoder, Json}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

class CommandsToEventsSnapshotSpec
  extends SnapShotDriverFixture[Vector[RfcCommand], Vector[RfcEvent]]("commands-to-events", "Commands to Events") {

  override def serializeOutput(output: Vector[RfcEvent]): Json = EventSerialization.toJson(output)
  override def deserializeInput(json: Json): Vector[RfcCommand] = CommandSerialization.fromJson(json).get
  override def deserializeOutput(json: Json): Vector[RfcEvent] = EventSerialization.fromJson(json).get

  override def transform(input: Vector[RfcCommand]): Vector[RfcEvent] = {
    val rfcId: String = "rfc-1"
    val eventStore = RfcServiceJSFacade.makeEventStore()
    val rfcService: RfcService = new RfcService(eventStore)
    rfcService.handleCommands(rfcId, RfcCommandContext("ccc", "sss", "bbb"), input:_*)

    eventStore.listEvents("rfc-1")
  }
}
