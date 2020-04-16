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

    def listExampleKeys = (exampleShapes.keys ++ exampleFields.keys ++ exampleItems.keys).toSeq.distinct.sorted

    def listExampleFieldKeys = exampleFields.map(i => s"${i._1} -> ${i._2.exampleValue.map(_.noSpaces)}").toSeq.sorted


    def getUnifiedShape(shapeId: ShapeId): Option[RenderShape] = {
      val exampleShape = exampleShapes.get(shapeId)
      val specShape = Seq(exampleShape.flatMap(_.specShapeId.flatMap(specShapes.get)), specShapes.get(shapeId)).flatten.headOption

      if (specShape.isDefined || exampleShape.isDefined) {

        val sFields = specShape.map(_.fields).getOrElse(Fields(Seq.empty, Seq.empty, Seq.empty, Seq.empty))
        val eFields = exampleShape.map(_.fields).getOrElse(Fields(Seq.empty, Seq.empty, Seq.empty, Seq.empty))
        val mergedFields = sFields.merge(eFields, this)


        val diffs = Set(specShape.map(_.diffs), exampleShape.map(_.diffs)).flatten.flatten
        val copyTarget = Seq(specShape, exampleShape).flatten.head

        Some(
          RenderShape(
            shapeId,
            specShape.map(_.shapeId),
            Seq(exampleShape.map(_.baseShapeId), specShape.map(_.baseShapeId)).flatten.head,
            mergedFields,
            Items(Seq.empty), //independently merged.
            Seq(exampleShape.map(_.branches), specShape.map(_.branches)).flatten.head,
            Seq(exampleShape.map(_.innerId), specShape.map(_.innerId)).flatten.head,
            exampleShape.flatMap(_.exampleValue),
            diffs,
            specShape.map(_.name).getOrElse(RenderName(Seq.empty))
          ))
      } else {
        None
      }
    }


    def getUnifiedItem(itemId: ShapeId, shapeIdOption: Option[ShapeId]): Option[RenderItem] = {
      exampleItems.get(itemId).map(exampleItem => {
        exampleItem.copy(shapeId = shapeIdOption)
      })
    }

    def unwrapInner(shape: RenderShape): Option[RenderShape] = {
      if (Set(OptionalKind.baseShapeId, NullableKind.baseShapeId).contains(shape.baseShapeId) && shape.innerId.isDefined) {
        getUnifiedShape(shape.innerId.get)
      } else {
        None
      }
    }

    def getUnifiedField(fieldId: FieldId): Option[RenderField] = {

      val specField = specFields.get(fieldId)
      //prefer example that exists in the spec
      val exampleField = Seq(exampleFields.find(_._2.specFieldId.contains(fieldId)).map(_._2), exampleFields.get(fieldId)).flatten.headOption


      if (specField.isEmpty && exampleField.isEmpty) {
        None
      } else {
        Some(RenderField(
          exampleField.get.fieldId,
          exampleField.flatMap(_.specFieldId),
          if (specField.isDefined) specField.get.fieldName else exampleField.get.fieldName,
          Seq(specField.flatMap(_.shapeId), exampleField.flatMap(_.shapeId)).flatten.headOption,
          exampleFields.get(fieldId).flatMap(_.exampleValue),
          exampleField.map(_.diffs).getOrElse(Set.empty) ++ specField.map(_.diffs).getOrElse(Set.empty)
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

      val itemsFromSpec = {
        val exampleShapeOption = exampleShapes.find(_._2.specShapeId.contains(listId)).map(_._2)
        exampleShapeOption.map(_.items).getOrElse(Items(Seq.empty))
      }

      val itemsFromExample = exampleShapes.get(listId).map(_.items).getOrElse(Items(Seq.empty))

      val items = if (itemsFromSpec.all.nonEmpty) itemsFromSpec else itemsFromExample

      val allItems = items.all.zipWithIndex.flatMap { case (itemId, index) => {
        //use spec one if provided, else fallback on example shape pointer
        val shapeIdOption = Seq(listItemOption.flatMap(_.shapeId), exampleItems.get(itemId).flatMap(_.shapeId)).flatten.headOption
        getUnifiedItem(itemId, shapeIdOption).map(i => DisplayItem(index, i, "visible"))
      }
      }

      //      println("ITEMS LOOK HERE "+ allItems.map(_.item.itemId).toString())
      //      println("ITEMS LOOK HERE "+ allItems.map(i => s"${i.item.index} index -> ${i.item.exampleValue.map(_.noSpaces)}"))

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

    def resolveFieldShape(field: RenderField): Option[RenderShape] = {
      //this is the problem line of code :(
      getUnifiedShape(field.fieldId)
      field.shapeId.flatMap(i => getUnifiedShape(i))
    }

    def resolveFieldShapeWithExampleBias(field: RenderField): Option[RenderShape] = {
      //this is the problem line of code :(
      getUnifiedShape(field.fieldId)
      field.shapeId.flatMap(i => getUnifiedShape(i))
    }

    def resolveItemShapeFromShapeId(shapeId: Option[ShapeId]): Option[RenderShape] = Try(getUnifiedShape(shapeId.get)).toOption.flatten

    def resolveItemShape(itemId: String): Option[RenderShape] = getUnifiedShape(itemId)
  }

  @JSExportAll
  case class Fields(expected: Seq[FieldId], missing: Seq[FieldId], unexpected: Seq[FieldId], hidden: Seq[FieldId] = Seq.empty) {
    def merge(o: Fields, renderShapeRoot: RenderShapeRoot) = {

      def mergeFieldSet(spec: Seq[FieldId], examples: Seq[FieldId]) = {
        val flattenedSpecFields = spec.flatMap(i => renderShapeRoot.getUnifiedField(i))
        val flattenedExampleFields = examples.flatMap(i => renderShapeRoot.getUnifiedField(i))
        import com.useoptic.utilities.DistinctBy._
        //take named fields from spec first, then fallback on the example fields
        (flattenedSpecFields ++ flattenedExampleFields).distinctByIfDefined(i => Some(i.fieldName)).map(_.fieldId)
      }

      Fields(
        mergeFieldSet(this.expected, o.expected),
        mergeFieldSet(this.missing, o.missing),
        mergeFieldSet(this.unexpected, o.unexpected),
        mergeFieldSet(this.hidden, o.hidden)
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
                         exampleValue: Option[Json],
                         diffs: Set[DiffResult],
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
