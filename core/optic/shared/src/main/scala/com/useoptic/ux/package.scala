package com.useoptic

import com.useoptic.contexts.requests.Commands.PathComponentId
import com.useoptic.contexts.requests.{HttpRequest, HttpResponse}
import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.Commands.{FieldId, ShapeId}
import com.useoptic.contexts.shapes.ShapesHelper
import com.useoptic.contexts.shapes.ShapesHelper.{NullableKind, OptionalKind, StringKind}
import com.useoptic.diff.ChangeType.ChangeType
import com.useoptic.diff.{DiffResult, InteractiveDiffInterpretation}
import com.useoptic.diff.interactions.{InteractionDiffResult, UnmatchedRequestBodyContentType, UnmatchedRequestBodyShape, UnmatchedResponseBodyContentType}
import com.useoptic.diff.interactions.interpreters.DiffDescription
import com.useoptic.diff.shapes.ShapeDiffResult
import com.useoptic.types.capture.HttpInteraction
import com.useoptic.ux.ShapeRenderInterfaces.SpecShape
import com.useoptic.ux.SharedInterfaces.SpecShapeId
import io.circe.Json
import io.circe.generic.auto._
import io.circe.syntax._

import scala.scalajs.js.annotation.JSExportAll
import scala.util.Try

package object ux {

  type DiffsToInteractionsMap = Map[InteractionDiffResult, Seq[HttpInteraction]]

  @JSExportAll
  case class Region(name: String, diffBlocks: Seq[DiffBlock]) {
    def isEmpty: Boolean = diffBlocks.isEmpty

    def allInteractions: Seq[HttpInteraction] = diffBlocks.flatMap(_.interactions).distinct

    def nonEmpty: Boolean = diffBlocks.nonEmpty
  }

  @JSExportAll
  case class TopLevelRegions(newRegions: Seq[NewRegionDiffBlock], bodyDiffs: Seq[BodyShapeDiffBlock]) {
    def hasNewRegions = newRegions.nonEmpty
  }

  type ToSuggestions = () => Seq[InteractiveDiffInterpretation]

  //Diff Types
  @JSExportAll
  trait DiffBlock {
    def inRequest: Boolean

    def inResponse: Boolean

    def interactions: Seq[HttpInteraction]

    def count = interactions.size

    def description: DiffDescription

    def suggestions: Seq[InteractiveDiffInterpretation]

    def firstSuggestion: InteractiveDiffInterpretation = suggestions.head
  }

  @JSExportAll
  case class UndocumentedURL(method: String, path: String, pathId: Option[PathComponentId], interactions: Seq[HttpInteraction]) {
    def count = interactions.length
  }

  @JSExportAll
  case class EndpointDiff(method: String, pathId: String, addedCount: Int, changedCount: Int, removedCount: Int)

  @JSExportAll
  case class NewRegionDiffBlock(diff: DiffResult,
                                interactions: Seq[HttpInteraction],
                                inRequest: Boolean,
                                inResponse: Boolean,
                                contentType: Option[String],
                                statusCode: Option[Int],
                                description: DiffDescription)
                               (implicit val getSuggestion: Boolean => InteractiveDiffInterpretation, _previewDiff: (HttpInteraction) => Option[SideBySideRenderHelper], _previewDiffShape: (HttpInteraction, Boolean) => Option[ShapeOnlyRenderHelper]) extends DiffBlock {
    def suggestion(inferPolymorphism: Boolean): InteractiveDiffInterpretation = getSuggestion(inferPolymorphism)
    override def suggestions: Seq[InteractiveDiffInterpretation] = Seq(suggestion(false))
    def previewRender(interaction: HttpInteraction = interactions.head): Option[SideBySideRenderHelper] = _previewDiff(interaction)
    def previewShape(interaction: HttpInteraction, inferPolymorphism: Boolean): Option[ShapeOnlyRenderHelper] = _previewDiffShape(interaction, inferPolymorphism)

  }

  @JSExportAll
  case class BodyShapeDiffBlock(diff: DiffResult,
                                location: Seq[String],
                                shapeDiff: ShapeDiffResult,
                                interactions: Seq[HttpInteraction],
                                inRequest: Boolean,
                                inResponse: Boolean,
                                description: DiffDescription,
                                relatedDiffs: Set[ShapeDiffResult])
                               (implicit val toSuggestions: ToSuggestions,
                                _previewDiff: (HttpInteraction, Option[RfcState]) => SideBySideRenderHelper,
                                _previewRequest: (HttpInteraction, Option[RfcState]) => Option[SideBySideRenderHelper],
                                _previewResponse: (HttpInteraction, Option[RfcState]) => Option[SideBySideRenderHelper]) extends DiffBlock {

    def suggestions = toSuggestions()

    def previewRender(interaction: HttpInteraction = interactions.head, withRfcState: Option[RfcState] = None): SideBySideRenderHelper = _previewDiff(interaction, withRfcState)

    def previewRequest(interaction: HttpInteraction = interactions.head, withRfcState: Option[RfcState] = None): Option[SideBySideRenderHelper] = _previewRequest(interaction, withRfcState)

    def previewResponse(interaction: HttpInteraction = interactions.head, withRfcState: Option[RfcState] = None): Option[SideBySideRenderHelper] = _previewResponse(interaction, withRfcState)

    def containsDiff(diff: InteractionDiffResult): Boolean = diff.shapeDiffResultOption.exists(i => relatedDiffs.contains(i))
  }


  @JSExportAll
  case class ColoredName(text: String, color: String, link: Option[ShapeId])

  @JSExportAll
  case class RenderName(nameComponents: Seq[NameComponent]) {
    def flatten(implicit specShapes: Map[SpecShapeId, SpecShape]): Seq[NameComponent] = {
      nameComponents.flatMap(_.flatten)
    }

    def asColoredString(implicit specShapes: Map[SpecShapeId, SpecShape]): Seq[ColoredName] = flatten.map(i => ColoredName(i.startText, i.color, {
      //no links to primitives
      if (i.link.isEmpty || ShapesHelper.allCoreShapes.exists(s => i.link.contains(s))) {
        None
      } else {
        i.link
      }
    }))
  }

  @JSExportAll
  case class NameComponent(startText: String, color: String, endText: String = "", inner: Option[ShapeId] = None, link: Option[ShapeId] = None) {
    def flatten(implicit specShapes: Map[SpecShapeId, SpecShape]): Seq[NameComponent] = {
      if (inner.isDefined) {
        Seq(
          Seq(NameComponent(startText, color)),
          inner.map(i => specShapes(i).name.flatten).getOrElse(Seq.empty),
          Seq(NameComponent(startText = endText, color))
        ).flatten
      } else {
        Seq(this)
      }
    }
  }

}

@JSExportAll
case class DiffStats(totalInteractions: Int, totalDiffs: Int, undocumentedEndpoints: Int)
