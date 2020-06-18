package com.useoptic.end_to_end.snapshot_task

import com.useoptic.contexts.rfc.Commands.RfcCommand
import com.useoptic.contexts.rfc.Events.RfcEvent
import com.useoptic.contexts.rfc.{RfcCommandContext, RfcService, RfcServiceJSFacade}
import com.useoptic.serialization.{CommandSerialization, EventSerialization}
import io.circe.{Decoder, Encoder, Json}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import org.scalatest.{BeforeAndAfter, BeforeAndAfterAll}

class CommandsToEventsSnapshotSpec extends CommandsToEventsSnapshotTask {
  //add managed cases
  when("Case name", () => Vector())

  //run the suite
  runSuite
}
