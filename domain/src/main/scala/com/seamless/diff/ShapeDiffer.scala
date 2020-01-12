package com.seamless.diff

import com.seamless.contexts.shapes.Commands._
import com.seamless.contexts.shapes.ShapesHelper._
import com.seamless.contexts.shapes.projections.NameForShapeId
import com.seamless.contexts.shapes.{ShapeEntity, ShapesState}
import io.circe._
import io.circe.generic.auto._
import com.seamless.diff.ShapeTrail.ShapeTrailImplicits
import io.circe.syntax._

import scala.scalajs.js.annotation.{JSExport, JSExportAll, JSExportDescendentClasses}


object ShapeDiffer {

  @JSExportDescendentClasses
  @JSExportAll
  sealed trait ShapeDiffResult {
    def asJs = {
      import io.circe.scalajs.convertJsonToJs
      convertJsonToJs(this.asJson)
    }
  }
  case class NoDiff() extends ShapeDiffResult
  case class NoExpectedShape(expected: ShapeEntity, actual: Option[ShapeLikeJs]) extends ShapeDiffResult
  case class WeakNoDiff(expected: ShapeEntity, actual: Option[ShapeLikeJs]) extends ShapeDiffResult
  case class UnsetShape(actual: ShapeLikeJs) extends ShapeDiffResult
  case class UnsetValue(expected: ShapeEntity) extends ShapeDiffResult
  case class NullValue(expected: ShapeEntity) extends ShapeDiffResult
  case class ShapeMismatch(expected: ShapeEntity, actual: ShapeLikeJs, trail: ShapeTrail) extends ShapeDiffResult
  case class ListItemShapeMismatch(expectedList: ShapeEntity, actualList: ShapeLikeJs, expectedItem: ShapeEntity, actualItem: ShapeLikeJs, trail: ShapeTrail) extends ShapeDiffResult
  case class UnsetObjectKey(parentObjectShapeId: ShapeId, fieldId: FieldId, key: String, expected: ShapeEntity, trail: ShapeTrail) extends ShapeDiffResult
  case class NullObjectKey(parentObjectShapeId: ShapeId, fieldId: FieldId, key: String, expected: ShapeEntity, trail: ShapeTrail) extends ShapeDiffResult
  case class UnexpectedObjectKey(parentObjectShapeId: ShapeId, key: String, expected: ShapeEntity, actual: ShapeLikeJs, trail: ShapeTrail) extends ShapeDiffResult
  case class KeyShapeMismatch(fieldId: FieldId, key: String, expected: ShapeEntity, actual: ShapeLikeJs, trail: ShapeTrail) extends ShapeDiffResult
  case class MapValueMismatch(key: String, expected: ShapeEntity, actual: ShapeLikeJs) extends ShapeDiffResult
  case class MultipleInterpretations(expected: ShapeEntity, actual: ShapeLikeJs, trail: ShapeTrail) extends ShapeDiffResult
  type ParameterBindings = Map[ShapeParameterId, Option[ProviderDescriptor]]

  def diffJson(expectedShape: ShapeEntity, jsonOption: Option[Json])(implicit shapesState: ShapesState, bindings: ParameterBindings = Map.empty): Iterator[ShapeDiffResult] = {
    diff(expectedShape, ShapeLike.fromActualJson(jsonOption))
  }

  //@TODO change bindings to UsageTrail
  def diff(expectedShape: ShapeEntity, actualShape: ShapeLike)(implicit shapesState: ShapesState, bindings: ParameterBindings = Map.empty, trail: ShapeTrail = ShapeTrail.empty): Iterator[ShapeDiffResult] = {
    val coreShape = toCoreShape(expectedShape, shapesState)
    if (actualShape.isEmpty) {
      val diff = coreShape match {
        case UnknownKind => Iterator(NoExpectedShape(expectedShape, actualShape.asJsOption))
        case AnyKind => Iterator(WeakNoDiff(expectedShape, actualShape.asJsOption))
        case OptionalKind => Iterator.empty
        case _ => Iterator(UnsetValue(expectedShape))
      }
      return diff
    }

    coreShape match {
      case AnyKind => {
        Iterator(WeakNoDiff(expectedShape, actualShape.asJsOption))
      }
      case UnknownKind => {
        Iterator(NoExpectedShape(expectedShape, actualShape.asJsOption))
      }
      case StringKind => {
        if (actualShape.isString) {
          Iterator.empty
        } else {
          shapeMismatchOrMissing(expectedShape, actualShape)
        }
      }
      case BooleanKind => {
        if (actualShape.isBoolean) {
          Iterator.empty
        } else {
          shapeMismatchOrMissing(expectedShape, actualShape)
        }
      }
      case NumberKind => {
        if (actualShape.isNumber) {
          Iterator.empty
        } else {
          shapeMismatchOrMissing(expectedShape, actualShape)
        }
      }
      case ListKind => {
        if (actualShape.isArray) {
          val itemShape = resolveParameterShape(expectedShape.shapeId, "$listItem")
          if (itemShape.isDefined) {
            actualShape.items.toIterator.flatMap(item => {
              val diff = ShapeDiffer.diff(itemShape.get, item)(shapesState, bindings, trail.listItem)
              diff.flatMap {
                case sd: NoDiff => None
                case sd: ShapeMismatch => Some(ListItemShapeMismatch(expectedShape, actualShape.asJs, itemShape.get, item.asJs, trail))
                case x => {
//                  println("diff within list")
                  Some(x)
                }
              }
            })
          } else {
            Iterator.empty
          }
        } else {
          shapeMismatchOrMissing(expectedShape, actualShape)
        }
      }
      case ObjectKind => {
        if (actualShape.isObject) {
          val o = actualShape.fields
          val baseObject = resolveBaseObject(expectedShape.shapeId)

          val expectedFields = baseObject.descriptor.fieldOrdering.flatMap(fieldId => {
            val field = shapesState.fields(fieldId)
            if (field.isRemoved) {
              None
            } else {
              Some((field.descriptor.name, field))
            }
          })
          val actualFields = actualShape.fields.toIterable
          val expectedKeys = expectedFields.map(_._1).toSet
          val actualKeys = actualFields.map(_._1).toSet

          val flattenedShape = shapesState.flattenedShape(expectedShape.shapeId)

          // make sure all expected keys match the spec
          val fieldMap = expectedFields.toMap
          val expectedKeysDiff = expectedKeys.toIterator.flatMap(key => {
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
              val actualFieldValue = actualShape.getField(key)
              implicit val bindings: ParameterBindings = flattenedField.bindings ++ flattenedShape.bindings
              val diffs = ShapeDiffer.diff(expectedFieldShape.get, actualFieldValue)(shapesState, bindings, trail.append(key))
              diffs.flatMap {
                case d: ShapeMismatch => Some(KeyShapeMismatch(field.fieldId, key, expectedFieldShape.get, actualFieldValue.asJs, trail))
                case d: UnsetValue => Some(UnsetObjectKey(expectedShape.shapeId, field.fieldId, key, expectedFieldShape.get, trail))
                case d: NullValue => Some(NullObjectKey(expectedShape.shapeId, field.fieldId, key, expectedFieldShape.get, trail))
                case x: NoDiff => None
                case x => {
//                  println("diff within object key")
                  Some(x)
                }
              }
            } else {
              None
            }
          })

          // detect keys that should not be present
          val extraKeys = actualKeys -- expectedKeys
          val extraKeysDiff = extraKeys.toIterator.flatMap(key => {
            val actualFieldValue = o(key)
            Iterator(UnexpectedObjectKey(baseObject.shapeId, key, baseObject, actualFieldValue.asJs, trail))
          })

          expectedKeysDiff ++ extraKeysDiff
        } else {
          shapeMismatchOrMissing(expectedShape, actualShape)
        }
      }
      case NullableKind => {
        val referencedShape = resolveParameterShape(expectedShape.shapeId, "$nullableInner")
        if (referencedShape.isDefined) {
          if (actualShape.isNull) {
            Iterator.empty
          } else {
            ShapeDiffer.diff(referencedShape.get, actualShape)
          }
        } else {
          Iterator(WeakNoDiff(expectedShape, actualShape.asJsOption))
        }
      }
      case OptionalKind => {
        val referencedShape = resolveParameterShape(expectedShape.shapeId, OptionalKind.innerParam)
        if (referencedShape.isDefined) {
          ShapeDiffer.diff(referencedShape.get, actualShape)
        } else {
          Iterator(WeakNoDiff(expectedShape, actualShape.asJsOption))
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
            val diff = ShapeDiffer.diff(referencedShape.get, actualShape)
            diff.isEmpty
          } else {
            false
          }
        })
//        println(firstMatch)
        if (firstMatch.isDefined) {
          Iterator.empty
        } else {
          Iterator(MultipleInterpretations(expectedShape, actualShape.asJs, trail))
        }
      }
      case MapKind => {
        if (actualShape.isObject) {
          val referencedShape = resolveParameterShape(expectedShape.shapeId, "$mapValue")
          if (referencedShape.isDefined) {
            actualShape.fields.keys.toIterator.flatMap(key => {
              val v = actualShape.fields(key)
              val diff = ShapeDiffer.diff(referencedShape.get, v)
              diff.flatMap {
                case d: ShapeMismatch => Some(MapValueMismatch(key, referencedShape.get, v.asJs))
                case d: UnsetValue => Some(MapValueMismatch(key, referencedShape.get, v.asJs))
                case x: NoDiff => None
                case x => Some(x)
              }
            })
          } else {
            Iterator(WeakNoDiff(expectedShape, actualShape.asJsOption))
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
        Iterator(WeakNoDiff(expectedShape, actualShape.asJsOption))
      }
      case IdentifierKind => {
        val identifierShape = resolveParameterShape(expectedShape.shapeId, "$identifierInner")
        if (identifierShape.isDefined) {
          //@TODO: identifierShape should be a string or number. Diff the actualShape against it.
        }
        Iterator(WeakNoDiff(expectedShape, actualShape.asJsOption))
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

  def shapeMismatchOrMissing(expectedShape: ShapeEntity, actualShape: ShapeLike)(implicit shapesState: ShapesState, bindings: ParameterBindings = Map.empty, trail: ShapeTrail): Iterator[ShapeDiffResult] = {
    if (actualShape.isSpecShape) {
      Iterator(ShapeMismatch(expectedShape, actualShape.asJs, trail))
    } else {
      if (actualShape.isNull) {
        Iterator(NullValue(expectedShape))
      } else {
        Iterator(ShapeMismatch(expectedShape, actualShape.asJs, trail))
      }
    }

  }
}
