package com.seamless.diff

import com.seamless.contexts.shapes.Commands._
import com.seamless.contexts.shapes.ShapesHelper._
import com.seamless.contexts.shapes.{ShapeEntity, ShapesState}
import io.circe._


object ShapeDiffer {
  sealed trait ShapeDiffResult {}
  case class NoDiff() extends ShapeDiffResult
  case class WeakNoDiff() extends ShapeDiffResult
  case class UnsetShape(actual: Json) extends ShapeDiffResult
  case class UnsetValue(expected: ShapeEntity) extends ShapeDiffResult
  case class NullValue(expected: ShapeEntity) extends ShapeDiffResult
  case class ShapeMismatch(expected: ShapeEntity, actual: Json) extends ShapeDiffResult
  case class UnsetObjectKey(parentObjectShapeId: ShapeId, fieldId: FieldId, key: String, expected: ShapeEntity) extends ShapeDiffResult
  case class NullObjectKey(parentObjectShapeId: ShapeId, fieldId: FieldId, key: String, expected: ShapeEntity) extends ShapeDiffResult
  case class UnexpectedObjectKey(parentObjectShapeId: ShapeId, key: String, expected: ShapeEntity, actual: Json) extends ShapeDiffResult
  case class KeyShapeMismatch(fieldId: FieldId, key: String, expected: ShapeEntity, actual: Json) extends ShapeDiffResult
  case class MapValueMismatch(key: String, expected: ShapeEntity, actual: Json) extends ShapeDiffResult
  case class MultipleInterpretations(expected: ShapeEntity, actual: Json) extends ShapeDiffResult
  type ParameterBindings = Map[ShapeParameterId, Option[ProviderDescriptor]]

  //@TODO change bindings to UsageTrail
  def diff(expectedShape: ShapeEntity, actualShapeOption: Option[Json])(implicit shapesState: ShapesState, bindings: ParameterBindings = Map.empty): ShapeDiffResult = {
    // println(expectedShape, actualShape, bindings)

    val coreShape = toCoreShape(expectedShape, shapesState)
    if (actualShapeOption.isEmpty) {
      val diff = coreShape match {
        case AnyKind => WeakNoDiff()
        case OptionalKind => NoDiff()
        case _ => UnsetValue(expectedShape)
      }
      return diff
    }

    val actualShape = actualShapeOption.get
    coreShape match {
      case AnyKind => {
        WeakNoDiff()
      }
      case StringKind => {
        if (actualShape.isString) {
          NoDiff()
        } else {
          shapeMismatchOrMissing(expectedShape, actualShape)
        }
      }
      case BooleanKind => {
        if (actualShape.isBoolean) {
          NoDiff()
        } else {
          shapeMismatchOrMissing(expectedShape, actualShape)
        }
      }
      case NumberKind => {
        if (actualShape.isNumber) {
          NoDiff()
        } else {
          shapeMismatchOrMissing(expectedShape, actualShape)
        }
      }
      case ListKind => {
        if (actualShape.isArray) {
          val itemShape = resolveParameterShape(expectedShape.shapeId, "$listItem")
          if (itemShape.isDefined) {
            actualShape.asArray.get.foreach(item => {
              val diff = ShapeDiffer.diff(itemShape.get, Some(item))
              diff match {
                case sd: NoDiff =>
                case x => return x
              }
            })
          }
          NoDiff()
        } else {
          shapeMismatchOrMissing(expectedShape, actualShape)
        }
      }
      case ObjectKind => {
        if (actualShape.isObject) {
          val o = actualShape.asObject.get
          val baseObject = resolveBaseObject(expectedShape.shapeId)

          val expectedFields = baseObject.descriptor.fieldOrdering
            .map(fieldId => {
              val field = shapesState.fields(fieldId)
              (field.descriptor.name, field)
            })
          val actualFields = o.toIterable
          val expectedKeys = expectedFields.map(_._1).toSet
          val actualKeys = actualFields.map(_._1).toSet

          val flattenedShape = shapesState.flattenedShape(expectedShape.shapeId)

          // make sure all expected keys match the spec
          val fieldMap = expectedFields.toMap
          expectedKeys.foreach(key => {
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
                      None
                    }
                    case p: ShapeProvider => Some(shapesState.shapes(p.shapeId))
                    case p: NoProvider => None
                  }
                  case None => None
                }
              }
            }
            if (expectedFieldShape.isDefined) {
              val actualFieldValue = o(key)
              implicit val bindings: ParameterBindings = flattenedField.bindings ++ flattenedShape.bindings
              val diff = ShapeDiffer.diff(expectedFieldShape.get, actualFieldValue)
              diff match {
                case d: ShapeMismatch => return KeyShapeMismatch(field.fieldId, key, expectedFieldShape.get, actualFieldValue.get)
                case d: UnsetValue => return UnsetObjectKey(expectedShape.shapeId, field.fieldId, key, expectedFieldShape.get)
                case d: NullValue => return NullObjectKey(expectedShape.shapeId, field.fieldId, key, expectedFieldShape.get)
                case x: NoDiff =>
                case x => {
                  return x
                }
              }
            }
          })

          // detect keys that should not be present
          val extraKeys = actualKeys -- expectedKeys
          if (extraKeys.nonEmpty) {
            val actualFieldValue = o(extraKeys.head).get
            return UnexpectedObjectKey(baseObject.shapeId, extraKeys.head, baseObject, actualFieldValue)
          }

          NoDiff()
        } else {
          shapeMismatchOrMissing(expectedShape, actualShape)
        }
      }
      case NullableKind => {
        val referencedShape = resolveParameterShape(expectedShape.shapeId, "$nullableInner")
        if (referencedShape.isDefined) {
          if (actualShape.isNull) {
            NoDiff()
          } else {
            ShapeDiffer.diff(referencedShape.get, actualShapeOption)
          }
        } else {
          WeakNoDiff()
        }
      }
      case OptionalKind => {
        val referencedShape = resolveParameterShape(expectedShape.shapeId, "$optionalInner")
        if (referencedShape.isDefined) {
          ShapeDiffer.diff(referencedShape.get, actualShapeOption)
        } else {
          WeakNoDiff()
        }
      }
      case OneOfKind => {
        // there's only a diff if none of the shapes match
        val shapeParameterIds = expectedShape.descriptor.parameters match {
          case DynamicParameterList(shapeParameterIds) => shapeParameterIds
        }
        val firstMatch = shapeParameterIds.find(shapeParameterId => {
          val referencedShape = resolveParameterShape(expectedShape.shapeId, shapeParameterId)
          if (referencedShape.isDefined) {
            val diff = ShapeDiffer.diff(referencedShape.get, actualShapeOption)
            diff == NoDiff()
          } else {
            false
          }
        })
        println(firstMatch)
        if (firstMatch.isDefined) {
          NoDiff()
        } else {
          MultipleInterpretations(expectedShape, actualShape)
        }
      }
      case MapKind => {
        if (actualShape.isObject) {
          val o = actualShape.asObject.get
          val referencedShape = resolveParameterShape(expectedShape.shapeId, "$mapValue")
          if (referencedShape.isDefined) {
            o.keys.foreach(key => {
              val v = o(key)
              val diff = ShapeDiffer.diff(referencedShape.get, v)
              diff match {
                case d: ShapeMismatch => return MapValueMismatch(key, referencedShape.get, v.get)
                case d: UnsetValue => return MapValueMismatch(key, referencedShape.get, v.get)
                case x: NoDiff =>
                case x => {
                  return x
                }
              }
            })
            NoDiff()
          } else {
            WeakNoDiff()
          }
        } else {
          shapeMismatchOrMissing(expectedShape, actualShape)
        }
      }
      case ReferenceKind => {
        val referencedShape = resolveParameterShape(expectedShape.shapeId, "$referenceInner")
        if (referencedShape.isDefined) {
          //@TODO: referencedShape should be an object. find the first field which is an Identifier<T>. Diff the actualShape against the resolved T
        }
        WeakNoDiff()
      }
      case IdentifierKind => {
        val identifierShape = resolveParameterShape(expectedShape.shapeId, "$identifierInner")
        if (identifierShape.isDefined) {
          //@TODO: identifierShape should be a string or number. Diff the actualShape against it.
        }
        WeakNoDiff()
      }
    }
  }

  def resolveParameterShape(shapeId: ShapeId, shapeParameterId: ShapeParameterId)(implicit shapesState: ShapesState, bindings: ParameterBindings): Option[ShapeEntity] = {
    val flattenedShape = shapesState.flattenedShape(shapeId)
    // println(bindings, flattenedShape.bindings)
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

  def resolveBaseObject(objectId: ShapeId)(implicit shapesState: ShapesState): ShapeEntity = {
    val o = shapesState.shapes(objectId)
    if (o.descriptor.baseShapeId == ObjectKind.baseShapeId) {
      o
    } else {
      resolveBaseObject(o.descriptor.baseShapeId)
    }
  }

  def shapeMismatchOrMissing(expectedShape: ShapeEntity, actualShape: Json): ShapeDiffResult = {
    if (actualShape.isNull) {
      NullValue(expectedShape)
    } else {
      ShapeMismatch(expectedShape, actualShape)
    }
  }
}