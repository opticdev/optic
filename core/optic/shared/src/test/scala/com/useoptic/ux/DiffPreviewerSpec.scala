package com.useoptic.ux

import com.useoptic.diff.{ChangeType, DiffResult}
import com.useoptic.diff.helpers.DiffHelpers
import com.useoptic.diff.interactions.InteractionDiffResult
import com.useoptic.diff.interactions.interpreters.{DiffDescription, Unspecified}
import com.useoptic.diff.shapes.visitors.DiffVisitors
import com.useoptic.diff.shapes.{JsonLikeTraverser, JsonTrail, ShapeDiffResult, ShapeTrail, ShapeTraverser}
import com.useoptic.end_to_end.fixtures.{JsonExamples, ShapeExamples}
import com.useoptic.types.capture.JsonLikeFrom
import org.scalatest.FunSpec
import io.circe.generic.auto._, io.circe.syntax._

class DiffPreviewerSpec extends FunSpec {

  it("can render") {

    val previewDiff: DiffResult = {
      val visitor = new DiffVisitors(ShapeExamples.todoShape._2)
      val traverse = new JsonLikeTraverser(ShapeExamples.todoShape._2, visitor)
      traverse.traverse(JsonLikeFrom.json(JsonExamples.basicTodoWithDescription), JsonTrail(Seq.empty), Some(ShapeTrail(ShapeExamples.todoShape._1.shapeId, Seq.empty)))
      val diff = visitor.diffs.toVector.head
      diff
    }

    val preview = DiffPreviewer.previewDiff(JsonLikeFrom.json(JsonExamples.basicTodoWithDescription), ShapeExamples.todoShape._2, ShapeExamples.todoShape._1.shapeId, previewDiff)

  }

}
