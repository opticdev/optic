package com.seamless.diff

import com.seamless.contexts.shapes.Commands._
import com.seamless.contexts.shapes.ShapesHelper._
import com.seamless.contexts.shapes.{ShapeEntity, ShapesState}
import io.circe._


object ShapeDiffer {
  sealed trait ShapeDiffResult {}
  case class NoDiff() extends ShapeDiffResult
  case class UnsetShape(actual: Json) extends ShapeDiffResult
  case class ShapeMismatch(expected: ShapeEntity, actual: Json) extends ShapeDiffResult
  case class MissingObjectKey(parentObjectShapeId: ShapeId, key: String, expected: ShapeEntity, actual: Json) extends ShapeDiffResult
  case class ExtraObjectKey(parentObjectShapeId: ShapeId, key: String, expected: ShapeEntity, actual: Json) extends ShapeDiffResult
  case class KeyShapeMismatch(fieldId: FieldId, key: String, expected: ShapeEntity, actual: Json) extends ShapeDiffResult
  case class MultipleInterpretations(s: ShapeDiffResult*) extends ShapeDiffResult

  def diff(expectedShape: ShapeEntity, actualShape: Json)(implicit shapesState: ShapesState): ShapeDiffResult = {
    val coreShape = toCoreShape(expectedShape)
    coreShape match {
      case AnyKind => {
        NoDiff()
      }
      case StringKind => {
        if (actualShape.isString) {
          NoDiff()
        } else {
          ShapeMismatch(expectedShape, actualShape)
        }
      }
      case BooleanKind => {
        if (actualShape.isBoolean) {
          NoDiff()
        } else {
          ShapeMismatch(expectedShape, actualShape)
        }
      }
      case NumberKind => {
        if (actualShape.isNumber) {
          NoDiff()
        } else {
          ShapeMismatch(expectedShape, actualShape)
        }
      }
      case ListKind => {
        if (actualShape.isArray) {
          NoDiff()
        } else {
          ShapeMismatch(expectedShape, actualShape)
        }
      }
      case ObjectKind => {
        if (actualShape.isObject) {
          val o = actualShape.asObject.get
          // need to capture fields that are in expected but not actual AND vice-versa
          val expectedFields = expectedShape.descriptor.fieldOrdering
            .map(fieldId => {
              val field = shapesState.fields(fieldId)
              (field.descriptor.name, field)
            })
          val actualFields = o.toIterable
          val expectedKeys = expectedFields.map(_._1).toSet
          val actualKeys = actualFields.map(_._1).toSet

          // detect keys that should be present but are not
          val missingKeys = expectedKeys -- actualKeys
          if (missingKeys.nonEmpty) {
            return MissingObjectKey(expectedShape.shapeId, missingKeys.head, expectedShape, actualShape)
          }
          // make sure all expected keys match the spec
          val commonKeys = expectedKeys.intersect(actualKeys)
          val fieldMap = expectedFields.toMap
          commonKeys.foreach(key => {
            val field = fieldMap(key)
            println(key, field)
            val flattenedField = shapesState.flattenedField(field.fieldId)
            val expectedShape = flattenedField.fieldShapeDescriptor match {
              case fsd: FieldShapeFromShape => {
                Some(shapesState.shapes(fsd.shapeId))
              }
              case fsd: FieldShapeFromParameter => {
                flattenedField.bindings(fsd.shapeParameterId) match {
                  case Some(value) => value match {
                    case p: ParameterProvider => None
                    case p: ShapeProvider => Some(shapesState.shapes(p.shapeId))
                    case p: NoProvider => None
                  }
                  case None => None
                }
              }
            }
            if (expectedShape.isDefined) {
              val actualFieldValue = o(key).get
              val diff = ShapeDiffer.diff(expectedShape.get, actualFieldValue)
              diff match {
                case d: ShapeMismatch => return KeyShapeMismatch(field.fieldId, key, expectedShape.get, actualFieldValue)
                case _ =>
              }
            }
          })

          // detect keys that should not be present
          val extraKeys = actualKeys -- expectedKeys
          if (extraKeys.nonEmpty) {
            return ExtraObjectKey(expectedShape.shapeId, extraKeys.head, expectedShape, actualShape)
          }

          NoDiff()
        } else {
          ShapeMismatch(expectedShape, actualShape)
        }
      }
      case OneOfKind => {
        MultipleInterpretations()
      }
      case MapKind => {
        // check all values
        NoDiff()
      }
      case _ => NoDiff()
    }
  }

  def resolveJsonToShapeId(x: Json)(implicit shapesState: ShapesState): ShapeId = {
    if (x.isString) {
      return "$string"
    }
    if (x.isNumber) {
      return "$number"
    }
    if (x.isBoolean) {
      return "$boolean"
    }
    "$any"
  }
}


/*
- refactor code so we can enumerate core shape ids and parameters
- deprioritize oneOf, identifier, reference?
- nullable?
expecting: number | string | boolean | object | list | map | oneOf (can yield multiple diffs...) | identifier[T] (T should be a primitive core shape) | reference[T] (T should have one field which is an identifier)

 */