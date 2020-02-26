package com.useoptic.end_to_end.snapshot

import com.useoptic.contexts.rfc.Commands.RfcCommand
import com.useoptic.contexts.rfc.Events.RfcEvent
import com.useoptic.contexts.rfc.{RfcService, RfcServiceJSFacade}
import com.useoptic.diff.helpers.DiffHelpers
import com.useoptic.diff.helpers.DiffHelpers.InteractionsGroupedByDiff
import com.useoptic.diff.interactions.InteractionDiffResult
import com.useoptic.end_to_end.fixtures.SnapShotDriverFixture
import com.useoptic.serialization.EventSerialization
import com.useoptic.types.capture.{HttpInteraction}
import io.circe.Json
import io.circe.syntax._
import io.circe._
import io.circe.generic.auto._
import io.circe.syntax._

case class RfcEventsAndInteraction(rfcEvents: Vector[RfcEvent], interactions: Vector[HttpInteraction])
class EventsAndInteractionToDiffs extends SnapShotDriverFixture[RfcEventsAndInteraction, Set[InteractionDiffResult]]("events-interaction-to-diff", "Events and interaction to Diff") {
  override def serializeOutput(output: Set[InteractionDiffResult]): Json = output.asJson

  override def deserializeInput(json: Json): RfcEventsAndInteraction = {
    val eventsJson = json.asObject.get.toMap("events")
    val events = EventSerialization.fromJson(eventsJson).get
    val interactions = json.asObject.get.toMap("session").asObject.get.toMap("samples").as[Vector[HttpInteraction]].right.get
    RfcEventsAndInteraction(events, interactions)
  }

  override def deserializeOutput(json: Json): Set[InteractionDiffResult] = {
    json.as[Set[InteractionDiffResult]].right.get
  }

  override def transform(input: RfcEventsAndInteraction): Set[InteractionDiffResult] = {
    val rfcId: String = "rfc-1"
    val eventStore = RfcServiceJSFacade.makeEventStore()
    eventStore.append(rfcId, input.rfcEvents)
    val rfcService: RfcService = new RfcService(eventStore)
    val rfcState = rfcService.currentState(rfcId)
    DiffHelpers.diffAll(rfcState, input.interactions)
  }
}
