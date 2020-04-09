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
  case class TopLevelRegions(newRegions: Seq[NewRegionDiffBlock], bodyDiffs: Seq[BodyShapeDiffBlock])

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
                               (implicit val toSuggestions: ToSuggestions) extends DiffBlock {
    def suggestions = toSuggestions()
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
                                _previewDiff: (HttpInteraction, Option[RfcState]) => RenderShapeRoot,
                                _previewRequest: (HttpInteraction, Option[RfcState]) => Option[RenderShapeRoot],
                                _previewResponse: (HttpInteraction, Option[RfcState]) => Option[RenderShapeRoot]) extends DiffBlock {

    def suggestions = toSuggestions()

    def previewRender(interaction: HttpInteraction = interactions.head, withRfcState: Option[RfcState] = None): RenderShapeRoot = _previewDiff(interaction, withRfcState)

    def previewRequest(interaction: HttpInteraction = interactions.head, withRfcState: Option[RfcState] = None): Option[RenderShapeRoot] = _previewRequest(interaction, withRfcState)

    def previewResponse(interaction: HttpInteraction = interactions.head, withRfcState: Option[RfcState] = None): Option[RenderShapeRoot] = _previewResponse(interaction, withRfcState)

    def containsDiff(diff: InteractionDiffResult): Boolean = diff.shapeDiffResultOption.exists(i => relatedDiffs.contains(i))
  }

  // Shape Renderer
  @JSExportAll
  case class RenderShapeRoot(rootId: ShapeId,
                             exampleFields: Map[FieldId, RenderField], specFields: Map[FieldId, RenderField],
                             exampleShapes: Map[ShapeId, RenderShape], specShapes: Map[ShapeId, RenderShape],
                             exampleItems: Map[ShapeId, RenderItem], specItems: Map[ShapeId, RenderItem]) {

    def getUnifiedShape(shapeId: ShapeId): RenderShape = {
      val specShape = specShapes.get(shapeId)
      //prefer the shape that's in the spec
      val exampleShape = Seq(exampleShapes.find(_._2.specShapeId.contains(shapeId)).map(_._2), exampleShapes.get(shapeId)).flatten.headOption

      assert(specShape.isDefined || exampleShape.isDefined, s"one of the render maps must include shapeId ${shapeId}")

      val sFields = specShape.map(_.fields).getOrElse(Fields(Seq.empty, Seq.empty, Seq.empty, Seq.empty))
      val eFields = exampleShape.map(_.fields).getOrElse(Fields(Seq.empty, Seq.empty, Seq.empty, Seq.empty))
      val mergedFields = sFields merge eFields

      val diffs = Set(specShape.map(_.diffs), exampleShape.map(_.diffs)).flatten.flatten

      val copyTarget = Seq(specShape, exampleShape).flatten.head
      copyTarget.copy(fields = mergedFields, exampleValue = exampleShape.flatMap(_.exampleValue), diffs = diffs)
    }

    def getUnifiedItem(itemId: ShapeId, shapeIdOption: Option[ShapeId]): Option[RenderItem] = {
      exampleItems.get(itemId).map(exampleItem => {
        exampleItem.copy(shapeId = shapeIdOption)
      })
    }

    def unwrapInner(shape: RenderShape): Option[RenderShape] = {
      if (Set(OptionalKind.baseShapeId, NullableKind.baseShapeId).contains(shape.baseShapeId) && shape.innerId.isDefined) {
        Some(getUnifiedShape(shape.innerId.get))
      } else {
        None
      }
    }

    def getUnifiedField(fieldId: FieldId): Option[RenderField] = {

      println("xxx TRYING TO RENDER "+fieldId)

      val specField = specFields.get(fieldId)

      println("xxx "+ specFields)

      //prefer example that exists in the spec
      val exampleField = Seq(exampleFields.find(_._2.specFieldId.contains(fieldId)).map(_._2),  exampleFields.get(fieldId)).flatten.headOption

      println("xxx "+ exampleFields)

      if (specField.isEmpty && exampleField.isEmpty) {
        None
      } else {
        Some(RenderField(
          if (specField.isDefined) specField.get.fieldId else exampleField.get.fieldId,
          specField.flatMap(_.shapeId),
          if (specField.isDefined) specField.get.fieldName else exampleField.get.fieldName,
          Seq(specField.flatMap(_.shapeId), exampleField.flatMap(_.shapeId)).flatten.headOption,
          exampleField.flatMap(_.exampleValue),
          specField.map(_.diffs).getOrElse(Set.empty) ++ exampleField.map(_.diffs).getOrElse(Set.empty)
        ))
      }
    }

    def resolveFields(fields: Fields): Seq[DisplayField] = {

      val unifiedMissing = fields.missing.flatMap(i => {
        val fieldOption = getUnifiedField(i)
        fieldOption.map(field => DisplayField(field.fieldName, field, "missing"))
      })

      val unifiedUnexpected = fields.unexpected.flatMap(i => {
        val fieldOption = getUnifiedField(i)
        fieldOption.map(field => DisplayField(field.fieldName, field, "unexpected"))
      })

      val unifiedExpected = fields.expected.flatMap(i => {
        val fieldOption = getUnifiedField(i)
        fieldOption.map(field => DisplayField(field.fieldName, field, "visible"))
      }).filterNot(i => unifiedMissing.exists(_.fieldName == i.fieldName))


      (unifiedExpected ++ unifiedMissing ++ unifiedUnexpected).sortBy(_.fieldName)
    }

    def listItemShape(listId: ShapeId): Option[RenderItem] = Try {
      val listItemSpecId = specShapes(listId).items.all.head
      specItems(listItemSpecId)
    }.toOption

    def resolvedItems(listId: ShapeId, hideItems: Boolean = false): Seq[DisplayItem] = {
      val listItemOption = listItemShape(listId)
      val exampleShapeOption = exampleShapes.find(_._2.specShapeId.contains(listId)).map(_._2)
      val items = exampleShapeOption.map(_.items).getOrElse(Items(Seq.empty))
      val allItems = items.all.zipWithIndex.flatMap { case (itemId, index) => {
        //use spec one if provided, else fallback on example shape pointer
        val shapeIdOption = Seq(listItemOption.flatMap(_.shapeId), exampleItems.get(itemId).flatMap(_.shapeId)).flatten.headOption
        getUnifiedItem(itemId, shapeIdOption).map(i => DisplayItem(index, i, "visible"))
      }}

      if (hideItems) {
        allItems.zipWithIndex.map {
          case (item, index) => {
            if (item.item.diffs.nonEmpty || index < 6) {
              item.copy(display = "visible")
            } else {
              item.copy(display = "hidden")
            }
          }
        }
      } else allItems
    }

    def resolveFieldShape(field: RenderField): Option[RenderShape] = Try(field.shapeId.map(getUnifiedShape)).toOption.flatten

    def resolveItemShapeFromShapeId(shapeId: Option[ShapeId]): Option[RenderShape] = Try(getUnifiedShape(shapeId.get)).toOption
    def resolveItemShape(itemOption: Option[RenderItem]): Option[RenderShape] = itemOption.flatMap(item => resolveItemShapeFromShapeId(item.shapeId))
  }

  @JSExportAll
  case class Fields(expected: Seq[FieldId], missing: Seq[FieldId], unexpected: Seq[FieldId], hidden: Seq[FieldId] = Seq.empty) {
    def merge(o: Fields) = {
      Fields(
        (expected ++ o.expected).distinct,
        (missing ++ o.missing).distinct,
        (unexpected ++ o.unexpected).distinct,
        (hidden ++ o.hidden).distinct
      )
    }
  }

  @JSExportAll
  case class Items(all: Seq[ShapeId])

  @JSExportAll
  case class DisplayField(fieldName: String, field: RenderField, display: String)

  @JSExportAll
  case class DisplayItem(index: Int, item: RenderItem, display: String)

  @JSExportAll
  case class RenderField(fieldId: FieldId, specFieldId: Option[FieldId], fieldName: String, shapeId: Option[ShapeId], exampleValue: Option[Json], diffs: Set[DiffResult] = Set())

  @JSExportAll
  case class RenderItem(itemId: ShapeId, index: Int, baseShapeId: String, shapeId: Option[ShapeId], exampleValue: Option[Json], diffs: Set[DiffResult] = Set())

  @JSExportAll
  case class RenderShape(shapeId: ShapeId,
                         specShapeId: Option[ShapeId],
                         baseShapeId: String,
                         fields: Fields = Fields(Seq.empty, Seq.empty, Seq.empty, Seq.empty),
                         items: Items = Items(Seq.empty),
                         branches: Seq[ShapeId] = Seq.empty,
                         innerId: Option[ShapeId] = None,
                         exampleValue: Option[Json] = None,
                         diffs: Set[DiffResult] = Set(),
                         name: RenderName = RenderName(Seq.empty)) {

    def isOptional = OptionalKind.baseShapeId == baseShapeId
    def isNullable = NullableKind.baseShapeId == baseShapeId
  }


  @JSExportAll
  case class ColoredName(text: String, color: String)

  @JSExportAll
  case class RenderName(nameComponents: Seq[NameComponent]) {
    def flatten(implicit shapeRoot: RenderShapeRoot): Seq[NameComponent] = {
      nameComponents.flatMap(_.flatten)
    }
    def asColoredString(implicit shapeRoot: RenderShapeRoot): Seq[ColoredName] = flatten.map(i => ColoredName(i.startText, i.color))
  }

  @JSExportAll
  case class NameComponent(startText: String, color: String, endText: String = "", inner: Option[ShapeId] = None) {
    def flatten(implicit shapeRoot: RenderShapeRoot): Seq[NameComponent] = {
      if (inner.isDefined) {
        Seq(
          Seq(NameComponent(startText, color)),
          inner.map(i => shapeRoot.specShapes(i).name.flatten).getOrElse(Seq.empty),
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
