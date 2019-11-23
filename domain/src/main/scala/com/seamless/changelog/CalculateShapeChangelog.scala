package com.seamless.changelog

import com.seamless.changelog.Changelog.{Change, FieldShapeChange, ListItemTypeChanged, NewField, NoChange, RemovedField, ShapeChange, UnhandledDiff}
import com.seamless.contexts.rfc.RfcState
import com.seamless.contexts.shapes.Commands.ShapeId
import com.seamless.contexts.shapes.ShapesState
import com.seamless.contexts.shapes.projections.NameForShapeId
import com.seamless.diff.ShapeDiffer.{KeyShapeMismatch, ListItemShapeMismatch, NoDiff, NoExpectedShape, NullValue, ShapeDiffResult, ShapeMismatch, UnexpectedObjectKey, UnsetObjectKey, UnsetShape, WeakNoDiff}
import com.seamless.diff.{ShapeDiffer, ShapeLike}

import scala.collection.immutable

object CalculateShapeChangelog {

  def changeLogForShape(historicalShapeId: ShapeId, currentShapeId: ShapeId, context: ChangelogContext)(implicit changelogInput: ChangelogInput): Seq[Change] = {
    val historical = toShapeLike(historicalShapeId, changelogInput.historicalState)
    val head       = toShapeLike(historicalShapeId, changelogInput.headState)

    val shapeDiff: immutable.Seq[ShapeDiffer.ShapeDiffResult] = ShapeDiffer.diff(historical.asShapeEntityOption.get, head)(changelogInput.historicalState.shapesState).toVector
    shapeDiff.map(i => diffToShapeChangeLog(i, context))
  }

  def diffToShapeChangeLog(sd: ShapeDiffResult, context: ChangelogContext)(implicit changelogInput: ChangelogInput): Change = {

    def oldFieldType(shapeIdOption: Option[String]) = {
      if (shapeIdOption.isDefined) {
        NameForShapeId.getFieldIdShapeName(shapeIdOption.get)(changelogInput.historicalState.shapesState).map(_.name).mkString(" ")
      } else "Any"
    }

    def newFieldType(shapeIdOption: Option[String]) = {
      if (shapeIdOption.isDefined) {
        NameForShapeId.getFieldIdShapeName(shapeIdOption.get)(changelogInput.headState.shapesState).map(_.name).mkString(" ")
      } else "Any"
    }

    def oldShapeType(shapeIdOption: Option[String]) = {
      if (shapeIdOption.isDefined) {
        NameForShapeId.getFlatShapeName(shapeIdOption.get)(changelogInput.historicalState.shapesState)
      } else "Any"
    }

    def newShapeType(shapeIdOption: Option[String]) = {
      if (shapeIdOption.isDefined) {
        NameForShapeId.getFlatShapeName(shapeIdOption.get)(changelogInput.headState.shapesState)
      } else "Any"
    }

    sd match {
      case NoDiff() => NoChange(context)
      case NoExpectedShape(_, _) => NoChange(context)
      case WeakNoDiff(_, _) => NoChange(context)
      case KeyShapeMismatch(fieldId, key, expected, actual) => {
        val tag = BasicBreakingChangeRules.changeShape(expected, actual, context)
        FieldShapeChange(fieldId, key, oldShapeType(Some(expected.shapeId)), newFieldType(Some(fieldId)), tag, context)
      }
      case ShapeMismatch(expected, actual) => {
        val tag = BasicBreakingChangeRules.changeShape(expected, actual, context)
        ShapeChange(actual.id.get, oldShapeType(Some(expected.shapeId)), newShapeType(Some(actual.id.get)), tag, context)
      }

      case ListItemShapeMismatch(expectedList, actualList, expectedItem, actualItem) => {
        ListItemTypeChanged(actualList.id.get, oldShapeType(Some(expectedList.shapeId)), newShapeType(actualList.id), UnknownChange, context)
      }

      case UnsetObjectKey(_, fieldId, key, _) => {
        RemovedField(fieldId, key, BasicBreakingChangeRules.removeField(context), context)
      }

      case UnexpectedObjectKey(_, key, _, actual) => {
        NewField(key, newFieldType(actual.id), BasicBreakingChangeRules.addField(context), context)
      }

      //    case MultipleInterpretations(expected, actual) =>

      //    I don't think we need to handle these...?
      //    case UnsetShape(actual) =>
      //    case UnsetValue(expected) =>
      //    case NullObjectKey(parentObjectShapeId, fieldId, key, expected) =>
      //    case NullValue(expected) =>
      //    case MapValueMismatch(key, expected, actual) =>
      //    case MapValueMismatch(key, expected, actual) =>

      case _ => UnhandledDiff(sd.toString, context)
    }
  }

  private def toShapeLike(shapeId: ShapeId, rfcState: RfcState): ShapeLike = {
    val shapeOption = rfcState.shapesState.shapes.get(shapeId)
    ShapeLike.fromShapeEntity(shapeOption, rfcState, shapeId)
  }

}
