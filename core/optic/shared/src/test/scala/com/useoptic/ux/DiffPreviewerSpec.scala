package com.useoptic.ux

import com.useoptic.contexts.rfc.{RfcCommandContext, RfcService, RfcServiceJSFacade, RfcState}
import com.useoptic.contexts.shapes.ShapeEntity
import com.useoptic.diff.{ChangeType, DiffResult, JsonFileFixture}
import com.useoptic.diff.helpers.DiffHelpers
import com.useoptic.diff.interactions.InteractionDiffResult
import com.useoptic.diff.interactions.interpreters.{DiffDescription, Unspecified}
import com.useoptic.diff.shapes.visitors.DiffVisitors
import com.useoptic.diff.shapes.{JsonLikeTraverser, JsonTrail, ShapeDiffResult, ShapeTrail, ShapeTraverser}
import com.useoptic.end_to_end.fixtures.{JsonExamples, ShapeExamples}
import com.useoptic.types.capture.JsonLikeFrom
import io.circe.Json
import org.scalatest.FunSpec
import io.circe.generic.auto._
import io.circe.syntax._

class DiffPreviewerSpec extends FunSpec with JsonFileFixture {

  def rfcStateFromEvents(e: String): RfcState = {
    val events = eventsFrom(e)
    val rfcId: String = "rfc-1"
    val eventStore = RfcServiceJSFacade.makeEventStore()
    eventStore.append(rfcId, events)
    val rfcService: RfcService = new RfcService(eventStore)
    rfcService.currentState(rfcId)
  }

  def previewFor(shapeExample: (ShapeEntity, RfcState), observation: Json) = {
    val previewDiffs = {
      val visitor = new DiffVisitors(shapeExample._2)
      val traverse = new JsonLikeTraverser(shapeExample._2, visitor)
      traverse.traverse(JsonLikeFrom.json(observation), JsonTrail(Seq.empty), Some(ShapeTrail(shapeExample._1.shapeId, Seq.empty)))
      visitor.diffs.toVector
    }
     DiffPreviewer.previewDiff(JsonLikeFrom.json(observation), shapeExample._2, ShapeExamples.todoShape._1.shapeId, previewDiffs.toSet)
  }

  it("can render a basic preview") {
    previewFor(ShapeExamples.todoShape, JsonExamples.basicTodoWithDescription)
  }

  it("can render a diff in array items preview") {
    val preview = previewFor(ShapeExamples.stringArray, JsonExamples.stringArrayWithNumbers)
  }

  describe("Example only render") {

    it("can render arbitrary json") {

      val preview = DiffPreviewer.previewJson(
        JsonLikeFrom.json(Json.obj("a" -> Json.fromBoolean(true), "b" -> Json.fromString("Aidan"))).get
      )

    }

  }

}
