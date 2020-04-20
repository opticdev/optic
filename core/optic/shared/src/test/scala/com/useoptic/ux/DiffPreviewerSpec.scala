package com.useoptic.ux

import com.useoptic.contexts.rfc.{RfcCommandContext, RfcService, RfcServiceJSFacade, RfcState}
import com.useoptic.contexts.shapes.ShapeEntity
import com.useoptic.contexts.shapes.ShapesHelper.ObjectKind
import com.useoptic.diff.{ChangeType, DiffResult, JsonFileFixture}
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

  def diffPreview(shapeExample: (ShapeEntity, RfcState), observation: Json) = {
    val previewDiffs = {
      val visitor = new DiffVisitors(shapeExample._2)
      val traverse = new JsonLikeTraverser(shapeExample._2, visitor)
      traverse.traverse(JsonLikeFrom.json(observation), JsonTrail(Seq.empty), Some(ShapeTrail(shapeExample._1.shapeId, Seq.empty)))
      visitor.diffs.toVector
    }

     DiffPreviewer.previewDiff(JsonLikeFrom.json(observation), shapeExample._2, Some(ShapeExamples.todoShape._1.shapeId), previewDiffs.toSet)
  }

  def shapeOnlyPreview(shapeExample: (ShapeEntity, RfcState)) = {
    DiffPreviewer.previewShape(shapeExample._2, Some(ShapeExamples.todoShape._1.shapeId)).get
  }


  import RenderTester._

  describe("diff render") {
    it("can render a basic preview") {
      val basicPreview = diffPreview(ShapeExamples.todoShape, JsonExamples.basicTodoWithDescription)
      val rootshape = basicPreview.getRootShape.get

      assert(rootshape.baseShapeId == ObjectKind.baseShapeId)
      assert(rootshape.fields.size == 3)
      assert(rootshape.field("isDone").specShape.isDefined)
      assert(rootshape.items.isEmpty)

      assert(rootshape.fields.exists(_.diffs.nonEmpty))
    }

    it("can render a diff in array items preview") {
      val preview = diffPreview(ShapeExamples.stringArray, JsonExamples.stringArrayWithNumbers)
      val rootshape = preview.getRootShape.get
      assert(rootshape.items.size == 12)
      assert(rootshape.items.count(_.diffs.nonEmpty) == 9)
    }

    it("can render a diff in nested object with unknown child fields") {
      val preview = diffPreview(ShapeExamples.nestedSimple, JsonExamples.nestedSimpleNew)
      val root = preview.getRootShape.get
      assert(root.field("novelField").exampleShape.get.fields.size == 1)
    }

    it("can render Racecar") {
      val preview = diffPreview(ShapeExamples.racecar, JsonExamples.racecar) // it has internal polymorphism :)
      val rootshape = preview.getRootShape.get
      val races = rootshape.field("MRData")
        .exampleShape.field("RaceTable")
        .exampleShape.field("Races")
        .exampleShape.get.items.head
        .exampleShape.field("Results")
        .exampleShape.get.itemsWithHidden(false)

      val display = races.map(_.display)

      assert(display(14) == "visible")

      val givenName = races.map(race => race.exampleShape.field("Driver").exampleShape.field("givenName").exampleShape.get.example)
      assert(givenName.distinct.size == givenName.size) //all are different
    }
  }

  describe("shape only render") {
    val shapeOnly = shapeOnlyPreview(ShapeExamples.todoShape).getRootShape.get
    assert(shapeOnly.asInstanceOf[RenderSpecObject].fields.size == 2)
  }

  describe("render simulated spec json") {
    val shapeOnly = DiffPreviewer.shapeOnlyFromShapeBuilder(JsonLikeFrom.json(JsonExamples.basicTodo))
    assert(shapeOnly.get.specShapes.size == 3)
  }

}
