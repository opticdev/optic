package com.seamless.diff

import com.seamless.contexts.shapes.ShapesHelper._
import com.seamless.contexts.shapes.{ShapeEntity, ShapesState}
import io.circe._


object ShapeDiffer {
  sealed trait ShapeDiffResult {}
  case class NoDiff() extends ShapeDiffResult
  case class ShapeMismatch(expected: ShapeEntity, actual: Json) extends ShapeDiffResult
  case class MissingObjectKey(key: String) extends ShapeDiffResult
  case class ExtraObjectKey(key: String) extends ShapeDiffResult
  case class KeyShapeMismatch(key: String, expected: ShapeEntity, actual: Json) extends ShapeDiffResult
  case class MultipleInterpretations(s: ShapeDiffResult*) extends ShapeDiffResult

  def diff(expectedShape: ShapeEntity, actualShape: Json)(implicit shapesState: ShapesState): ShapeDiffResult = {
    val coreShape = toCoreShape(expectedShape)
    coreShape match {
      case AnyKind() => {
        NoDiff()
      }
      case StringKind() => {
        if (actualShape.isString) {
          NoDiff()
        } else {
          ShapeMismatch(expectedShape, actualShape)
        }
      }
      case BooleanKind() => {
        if (actualShape.isBoolean) {
          NoDiff()
        } else {
          ShapeMismatch(expectedShape, actualShape)
        }
      }
      case NumberKind() => {
        if (actualShape.isNumber) {
          NoDiff()
        } else {
          ShapeMismatch(expectedShape, actualShape)
        }
      }
      case ListKind() => {
        if (actualShape.isArray) {
          NoDiff()
        } else {
          ShapeMismatch(expectedShape, actualShape)
        }
      }
      case ObjectKind() => {
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
          println(expectedFields.map(_._1))
          val actualKeys = actualFields.map(_._1).toSet
          println(expectedFields.map(_._1))
          val missingKeys = expectedKeys -- actualKeys
          val extraKeys = actualKeys -- expectedKeys
          val commonKeys = expectedKeys.intersect(actualKeys)
          println(missingKeys)
          println(extraKeys)
          missingKeys.toSeq.map(x => MissingObjectKey(x)) ++ extraKeys.toSeq.map(x => ExtraObjectKey(x))
          NoDiff()
        } else {
          ShapeMismatch(expectedShape, actualShape)
        }
      }
      case OneOfKind() => {
        MultipleInterpretations()
      }
      case MapKind() => {
        // check all values
        NoDiff()
      }

    }
  }
}


/*
- refactor code so we can enumerate core shape ids and parameters
- deprioritize oneOf, identifier, reference?
- nullable?
expecting: number | string | boolean | object | list | map | oneOf (can yield multiple diffs...) | identifier[T] (T should be a primitive core shape) | reference[T] (T should have one field which is an identifier)

 */