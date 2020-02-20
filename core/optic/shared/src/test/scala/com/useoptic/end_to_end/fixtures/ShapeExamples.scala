package com.useoptic.end_to_end.fixtures

import com.useoptic.contexts.rfc.{RfcCommandContext, RfcService, RfcServiceJSFacade, RfcState}
import com.useoptic.contexts.shapes.ShapeEntity
import com.useoptic.diff.initial.ShapeBuilder
import io.circe.Json

object ShapeExamples {

  val todoShape: (ShapeEntity, RfcState) = buildBasicShapeFrom(JsonExamples.basicTodo)

  private
  def buildBasicShapeFrom(json: Json): (ShapeEntity, RfcState) = {
    val builder = new ShapeBuilder(json, "snapshot_friendly").run
    val initialCommands = builder.commands

    val rfcId: String = "rfc-1"
    val eventStore = RfcServiceJSFacade.makeEventStore()
    val rfcService: RfcService = new RfcService(eventStore)
    rfcService.handleCommands(rfcId, RfcCommandContext("ccc", "sss", "bbb"), initialCommands: _*)
    (rfcService.currentState(rfcId).shapesState.shapes(builder.rootShapeId), rfcService.currentState(rfcId))
  }

}
