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
  type ParameterBindings = Map[ShapeParameterId, Option[ProviderDescriptor]]

  //@TODO change bindings to UsageTrail
  def diff(expectedShape: ShapeEntity, actualShape: Json)(implicit shapesState: ShapesState, bindings: ParameterBindings = Map.empty): ShapeDiffResult = {
    println(expectedShape, actualShape, bindings)
    val coreShape = toCoreShape(expectedShape, shapesState)
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
          val itemShape = resolveParameterShape(expectedShape.shapeId, "$listItem")
          println(itemShape)
          if (itemShape.isDefined) {
            actualShape.asArray.get.foreach(item => {
              val diff = ShapeDiffer.diff(itemShape.get, item)
              diff match {
                case sd: NoDiff =>
                case x => return x
              }
            })
          }
          NoDiff()
        } else {
          ShapeMismatch(expectedShape, actualShape)
        }
      }
      case ObjectKind => {
        if (actualShape.isObject) {
          val o = actualShape.asObject.get
          val baseObject = resolveBaseObject(expectedShape.shapeId)
          println(baseObject, actualShape.asObject.get)
          // need to capture fields that are in expected but not actual AND vice-versa
          val expectedFields = baseObject.descriptor.fieldOrdering
            .map(fieldId => {
              val field = shapesState.fields(fieldId)
              (field.descriptor.name, field)
            })
          val actualFields = o.toIterable
          val expectedKeys = expectedFields.map(_._1).toSet
          val actualKeys = actualFields.map(_._1).toSet

          // detect keys that should be present but are not
          val missingKeys = expectedKeys -- actualKeys
          println("missingKeys", missingKeys)
          if (missingKeys.nonEmpty) {
            return MissingObjectKey(baseObject.shapeId, missingKeys.head, baseObject, actualShape)
          }

          val flattenedShape = shapesState.flattenedShape(expectedShape.shapeId)
          // make sure all expected keys match the spec
          val commonKeys = expectedKeys.intersect(actualKeys)
          println("commonKeys", commonKeys)
          val fieldMap = expectedFields.toMap
          commonKeys.foreach(key => {
            val field = fieldMap(key)
            val flattenedField = shapesState.flattenedField(field.fieldId)
            val expectedFieldShape = flattenedField.fieldShapeDescriptor match {
              case fsd: FieldShapeFromShape => {
                Some(shapesState.shapes(fsd.shapeId))
              }
              case fsd: FieldShapeFromParameter => {
                flattenedField.bindings(fsd.shapeParameterId) match {
                  case Some(value) => value match {
                    case p: ParameterProvider => {
                      println("PP??")
                      None
                    }
                    case p: ShapeProvider => Some(shapesState.shapes(p.shapeId))
                    case p: NoProvider => None
                  }
                  case None => None
                }
              }
            }
            println(key, expectedFieldShape)
            if (expectedFieldShape.isDefined) {
              val actualFieldValue = o(key).get
              implicit val bindings: ParameterBindings = flattenedField.bindings ++ flattenedShape.bindings
              val diff = ShapeDiffer.diff(expectedFieldShape.get, actualFieldValue)
              diff match {
                case d: ShapeMismatch => return KeyShapeMismatch(field.fieldId, key, expectedFieldShape.get, actualFieldValue)
                case x: NoDiff =>
                case x => {
                  println(x)
                  return x
                }
              }
            }
          })

          // detect keys that should not be present
          val extraKeys = actualKeys -- expectedKeys
          println("extraKeys", extraKeys)
          if (extraKeys.nonEmpty) {
            return ExtraObjectKey(baseObject.shapeId, extraKeys.head, baseObject, actualShape)
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
      case ReferenceKind => {
        val referencedShape = resolveParameterShape(expectedShape.shapeId, "$referenceInner")
        if (referencedShape.isDefined) {
          //@TODO: referencedShape should be an object. find the first field which is an Identifier<T>. Diff the actualShape against the resolved T

        }
        NoDiff()
      }
      case IdentifierKind => {
        val identifierShape = resolveParameterShape(expectedShape.shapeId, "$identifierInner")
        if (identifierShape.isDefined) {
          //@TODO: identifierShape should be a string or number. Diff the actualShape against it.
        }
        NoDiff()
      }
    }
  }

  def resolveParameterShape(shapeId: ShapeId, shapeParameterId: ShapeParameterId)(implicit shapesState: ShapesState, bindings: ParameterBindings): Option[ShapeEntity] = {
    val flattenedShape = shapesState.flattenedShape(shapeId)
    println(bindings, flattenedShape.bindings)
    val itemShape: Option[ShapeEntity] = bindings.getOrElse(shapeParameterId, flattenedShape.bindings(shapeParameterId)) match {
      case Some(value) => value match {
        case ParameterProvider(shapeParameterId) => {
          resolveParameterShape(shapeId, shapeParameterId)
        }
        case ShapeProvider(shapeId) => Some(shapesState.shapes(shapeId))
        case NoProvider() => None
      }
      case None => None
    }
    itemShape
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

  def resolveBaseObject(objectId: ShapeId)(implicit shapesState: ShapesState): ShapeEntity = {
    val o = shapesState.shapes(objectId)
    if (o.descriptor.baseShapeId == "$object") {
      o
    } else {
      resolveBaseObject(o.descriptor.baseShapeId)
    }
  }
}


/*
- refactor code so we can enumerate core shape ids and parameters
- deprioritize oneOf, identifier, reference?
- nullable?
expecting: number | string | boolean | object | list | map | oneOf (can yield multiple diffs...) | identifier[T] (T should be a primitive core shape) | reference[T] (T should have one field which is an identifier)

 */