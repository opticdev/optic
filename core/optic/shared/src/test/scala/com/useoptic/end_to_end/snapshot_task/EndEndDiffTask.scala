package com.useoptic.end_to_end.snapshot_task

import com.useoptic.contexts.rfc.Commands.RfcCommand
import com.useoptic.contexts.rfc.Events.RfcEvent
import com.useoptic.contexts.rfc.{RfcCommandContext, RfcService, RfcServiceJSFacade}
import com.useoptic.diff.helpers.DiffHelpers
import com.useoptic.diff.interactions.InteractionDiffResult
import com.useoptic.diff.shapes.resolvers.ShapesResolvers
import com.useoptic.dsa.OpticIds
import com.useoptic.end_to_end.snapshot_task.EndEndDiffTask.{DiffOutput, Input}
import com.useoptic.serialization.{CommandSerialization, EventSerialization, InteractionSerialization}
import com.useoptic.types.capture.HttpInteraction
import com.useoptic.ux.SideBySideRenderHelper
import io.circe.Json
import io.circe._
import io.circe.generic.auto._
import io.circe.syntax._


object EndEndDiffTask {
  case class Input(events: Vector[RfcEvent], interpretations: Vector[HttpInteraction])
  case class DiffOutput(diffs: Set[InteractionDiffResult])
}

class EndEndDiffTask
  extends SnapShotDriverFixture[EndEndDiffTask.Input, EndEndDiffTask.DiffOutput]("events-interactions-diff-interpretation-ui-render", "Diff End to End") {

  override def serializeOutput(output: EndEndDiffTask.DiffOutput): Json = output.asJson
  override def deserializeInput(json: Json): EndEndDiffTask.Input = {
    val events = json.asObject.get("events").get
    EventSerialization.fromJson(events)
    val interpretations = json.asObject.get("interpretations").get.asArray.get.map(InteractionSerialization.fromJson)
    Input(EventSerialization.fromJson(events).get, interpretations)
  }
  override def serializeInput(input: EndEndDiffTask.Input): Json = {
    JsonObject.fromMap(Map("events" -> EventSerialization.toJson(input.events), "interpretations" -> input.interpretations.asJson)).asJson
  }
  override def deserializeOutput(json: Json): EndEndDiffTask.DiffOutput = json.as[EndEndDiffTask.DiffOutput].right.get

  override def transform(input: EndEndDiffTask.Input): EndEndDiffTask.DiffOutput = {
    val eventStore = RfcServiceJSFacade.makeEventStore()
    val rfcId = "testRfcId"
    eventStore.append(rfcId, input.events)
    implicit val ids = OpticIds.newDeterministicIdGenerator
    val rfcService = new RfcService(eventStore)
    val rfcState = rfcService.currentState(rfcId)

    val shapesResolvers = ShapesResolvers.newResolver(rfcState)

    val diffs = DiffHelpers.diffAll(shapesResolvers, rfcState, input.interpretations)

    DiffOutput(diffs)
  }
}
