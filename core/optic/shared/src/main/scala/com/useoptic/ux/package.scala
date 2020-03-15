package com.useoptic

import com.useoptic.contexts.shapes.Commands.{FieldId, ShapeId}
import com.useoptic.diff.ChangeType.ChangeType
import com.useoptic.diff.DiffResult
import com.useoptic.diff.interactions.{InteractionDiffResult, UnmatchedRequestBodyContentType, UnmatchedRequestBodyShape, UnmatchedResponseBodyContentType}
import com.useoptic.diff.interactions.interpreters.DiffDescription
import com.useoptic.diff.shapes.ShapeDiffResult
import com.useoptic.types.capture.HttpInteraction
import io.circe.Json
import io.circe.generic.auto._
import io.circe.syntax._

import scala.scalajs.js.annotation.JSExportAll

package object ux {

  type DiffsToInteractionsMap = Map[InteractionDiffResult, Seq[HttpInteraction]]

  @JSExportAll
  case class Region(name: String, diffBlocks: Seq[DiffBlock])
  @JSExportAll
  case class TopLevelRegions(newRegions: Region, requestRegions: Seq[Region], responseRegions: Seq[Region])


  //Diff Types
  trait DiffBlock
  @JSExportAll
  case class NewRegionDiffBlock(diff: DiffResult, interactions: Seq[HttpInteraction], inRequest: Boolean, inResponse: Boolean, contentType: Option[String], statusCode: Option[Int]) extends DiffBlock
  @JSExportAll
  case class BodyShapeDiffBlock(diff: DiffResult, shapeDiff: ShapeDiffResult, interactions: Seq[HttpInteraction], inRequest: Boolean, inResponse: Boolean, contentType: String) extends DiffBlock

  // Shape Renderer
  case class RenderShapeRoot(rootId: ShapeId,
                             exampleFields: Map[FieldId, RenderField], exampleShapes: Map[ShapeId, RenderShape],
                             specFields: Map[FieldId, RenderField], specShapes: Map[ShapeId, RenderShape])

  case class Fields(expected: Seq[FieldId], missing: Seq[FieldId], unexpected: Seq[FieldId], hidden: Seq[FieldId] = Seq.empty)
  case class Items(all: Seq[ShapeId], hidden: Seq[ShapeId])

  case class RenderField(fieldId: FieldId, fieldName: String, shapeId: Option[ShapeId], exampleValue: Option[Json], diffs: Set[DiffResult] = Set())
  case class RenderShape(shapeId: FieldId,
                         baseShapeId: String,
                         fields: Fields = Fields(Seq.empty, Seq.empty, Seq.empty, Seq.empty),
                         items: Items = Items(Seq.empty, Seq.empty),
                         exampleValue: Option[Json] = None,
                         diffs: Set[DiffResult] = Set())


}
