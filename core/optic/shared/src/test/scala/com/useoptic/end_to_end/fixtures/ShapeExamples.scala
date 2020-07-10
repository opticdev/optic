package com.useoptic.end_to_end.fixtures

import com.useoptic.contexts.rfc.{RfcCommandContext, RfcService, RfcServiceJSFacade, RfcState}
import com.useoptic.contexts.shapes.ShapeEntity
import com.useoptic.diff.initial.{DistributionAwareShapeBuilder, ShapeBuildingStrategy}
import com.useoptic.dsa.OpticIds
import com.useoptic.types.capture.JsonLikeFrom
import io.circe.Json

object ShapeExamples {

  val todoShape: (ShapeEntity, RfcState) = buildBasicShapeFrom(JsonExamples.basicTodo)
  val stringArray: (ShapeEntity, RfcState) = buildBasicShapeFrom(JsonExamples.stringArray)
  val racecar: (ShapeEntity, RfcState) = buildBasicShapeFrom(JsonExamples.racecar)
  val nestedSimple: (ShapeEntity, RfcState) = buildBasicShapeFrom(JsonExamples.nestedSimple)

  private
  def buildBasicShapeFrom(json: Json): (ShapeEntity, RfcState) = {
    val builtShape = DistributionAwareShapeBuilder.toCommands(Vector(JsonLikeFrom.json(json).get))(OpticIds.newDeterministicIdGenerator, ShapeBuildingStrategy.inferPolymorphism)


    val rfcId: String = "rfc-1"
    val eventStore = RfcServiceJSFacade.makeEventStore()
    implicit val ids = OpticIds.newDeterministicIdGenerator
    val rfcService: RfcService = new RfcService(eventStore)
    rfcService.handleCommands(rfcId, RfcCommandContext("ccc", "sss", "bbb"), builtShape._2.flatten: _*)
    (rfcService.currentState(rfcId).shapesState.shapes(builtShape._1), rfcService.currentState(rfcId))
  }

}
