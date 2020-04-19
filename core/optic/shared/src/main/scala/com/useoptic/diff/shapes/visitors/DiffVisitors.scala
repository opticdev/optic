package com.useoptic.diff.shapes.visitors

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.Commands.DynamicParameterList
import com.useoptic.contexts.shapes.ShapesHelper._
import com.useoptic.diff.shapes.JsonTrailPathComponent.JsonObjectKey
import com.useoptic.diff.shapes.Resolvers.{ParameterBindings, ResolvedTrail}
import com.useoptic.diff.shapes._
import com.useoptic.dsa.Counter
import com.useoptic.logging.Logger
import com.useoptic.types.capture.JsonLike

class DiffVisitors(spec: RfcState) extends JsonLikeVisitors {
  var diffs: Iterator[ShapeDiffResult] = Iterator.empty
  var visitedShapeTrails: Counter[ShapeTrail] = new Counter[ShapeTrail]()

  //@TODO @REFACTOR this should be injected by caller
  def emit(diff: ShapeDiffResult) = {
    Logger.log(s"got diff ${diff}")
    diffs = diffs ++ Iterator(diff)
  }

  //@TODO @REFACTOR this should be injected by caller
  def log(trail: Option[ShapeTrail]): Unit = {
    if (trail.isDefined) {
      visitedShapeTrails.increment(trail.get)
    }
  }

  class DiffArrayVisitor extends ArrayVisitor {
    override def begin(value: Vector[JsonLike], bodyTrail: JsonTrail, shapeTrail: ShapeTrail, resolvedShapeTrail: ResolvedTrail): Unit = {
      log(Some(shapeTrail))
      //@TODO: check against the expected shape for fundamental shape mismatch
      Logger.log("traversing array")
    }

    override def visit(index: Number, value: JsonLike, bodyTrail: JsonTrail, trail: Option[ShapeTrail]): Unit = {
      Logger.log(s"visiting $index")
      Logger.log(value)
      Logger.log(bodyTrail)
      Logger.log(trail)
    }

    override def end(): Unit = {

    }

  }

  override val arrayVisitor: ArrayVisitor = new DiffArrayVisitor()

  class DiffObjectVisitor() extends ObjectVisitor {

    override def begin(value: Map[String, JsonLike], bodyTrail: JsonTrail, expected: ResolvedTrail, shapeTrail: ShapeTrail): Unit = {
      log(Some(shapeTrail))
      Logger.log("visiting object")
      //@TODO: check against the expected shape for fundamental shape mismatch
      val fieldNameToId = expected.shapeEntity.descriptor.fieldOrdering
        .map(fieldId => {
          val field = spec.shapesState.fields(fieldId)
          //@GOTCHA need field bindings?
          val fieldShapeId = Resolvers.resolveFieldToShape(spec.shapesState, fieldId, expected.bindings).flatMap(x => {
            Some(x.shapeEntity.shapeId)
          }).get
          (field.descriptor.name -> (fieldId, fieldShapeId, field))
        }).toMap
      fieldNameToId.foreach(entry => {
        val (fieldName, (fieldId, fieldShapeId, field)) = entry
        if (!value.contains(fieldName) && !field.isRemoved) {
          Logger.log(s"object is missing field ${fieldName}")
          primitiveVisitor.visit(None, bodyTrail.withChild(JsonObjectKey(fieldName)), Some(shapeTrail.withChild(ObjectFieldTrail(fieldId, fieldShapeId))))
        }
      })
      value.keys.foreach(key => {
        if (!fieldNameToId.contains(key)) {
          Logger.log(s"object has extra field ${key}")
          emit(UnspecifiedShape(bodyTrail.withChild(JsonObjectKey(key)), shapeTrail))
        }
      })
    }

    override def visit(key: String, value: JsonLike, bodyTrail: JsonTrail, trail: Option[ShapeTrail], parentBindings: ParameterBindings): Unit = {
      Logger.log(s"visiting ${key}")
    }

    override def end(): Unit = {
      Logger.log("done visiting object")
    }
  }

  override val objectVisitor: ObjectVisitor = new DiffObjectVisitor()

  class DiffPrimitiveVisitor(emit: (ShapeDiffResult) => Unit) extends PrimitiveVisitor {
    override def visit(value: Option[JsonLike], bodyTrail: JsonTrail, trail: Option[ShapeTrail]): Unit = {
      log(trail)
      Logger.log("primitive visitor")
      Logger.log(bodyTrail)
      if (trail.isEmpty) {
        throw new Error("did not expect an empty trail")
      }
      Logger.log(trail.get)
      val resolvedTrail = Resolvers.resolveTrailToCoreShape(spec, trail.get)
      if (value.isEmpty) {
        resolvedTrail.coreShapeKind match {
          case OptionalKind => {
          }
          case _ => {
            Logger.log(bodyTrail)
            Logger.log(resolvedTrail.coreShapeKind)
            emit(UnmatchedShape(bodyTrail, trail.get))
          }
        }
        return
      }
      Logger.log(value, trail.get)
      Logger.log(resolvedTrail.shapeEntity)
      Logger.log(resolvedTrail.coreShapeKind)
      resolvedTrail.coreShapeKind match {
        case UnknownKind => {
          emit(UnspecifiedShape(bodyTrail, trail.get))
        }
        case OneOfKind => {
          val oneOfShapeId = resolvedTrail.shapeEntity.shapeId
          // there's only a diff if none of the shapes match
          val shapeParameterIds = resolvedTrail.shapeEntity.descriptor.parameters match {
            case DynamicParameterList(shapeParameterIds) => shapeParameterIds
            case _ => Seq()
          }
          val firstMatch = shapeParameterIds.find(shapeParameterId => {
            val referencedShape = Resolvers.resolveParameterToShape(spec.shapesState, oneOfShapeId, shapeParameterId, resolvedTrail.bindings)
            if (referencedShape.isDefined) {
              var oneOfDiffs: Seq[ShapeDiffResult] = Seq.empty
              val emit = (shapeDiff: ShapeDiffResult) => {
                oneOfDiffs = oneOfDiffs :+ shapeDiff
              }
              new DiffPrimitiveVisitor(emit).visit(value, bodyTrail, Some(trail.get.withChildren(OneOfItemTrail(oneOfShapeId, referencedShape.get.shapeId))))
              Logger.log("oneOf diffs")
              Logger.log(oneOfDiffs)
              oneOfDiffs.isEmpty
            } else {
              false
            }
          })
          if (firstMatch.isEmpty) {
            emit(UnmatchedShape(bodyTrail, trail.get))
          }
        }
        case NullableKind => {
          if (value.get.isNull) {
            Logger.log("expected null, got null")
          } else {
            val innerShapeId = Resolvers.resolveParameterToShape(spec.shapesState, resolvedTrail.shapeEntity.shapeId, NullableKind.innerParam, resolvedTrail.bindings)
            visit(value, bodyTrail, Some(trail.get.withChild(NullableTrail(innerShapeId.get.shapeId))))
          }
        }
        case OptionalKind => {
          val innerShapeId = Resolvers.resolveParameterToShape(spec.shapesState, resolvedTrail.shapeEntity.shapeId, OptionalKind.innerParam, resolvedTrail.bindings)
          visit(value, bodyTrail, Some(trail.get.withChild(OptionalTrail(innerShapeId.get.shapeId))))
        }
        case StringKind => {
          if (value.get.isString) {
            Logger.log("expected string, got string")
          } else {
            emit(UnmatchedShape(bodyTrail, trail.get))
          }
        }
        case NumberKind => {
          if (value.get.isNumber) {
            Logger.log("expected number, got number")
          } else {
            emit(UnmatchedShape(bodyTrail, trail.get))
          }
        }
        case BooleanKind => {
          if (value.get.isBoolean) {
            Logger.log("expected boolean, got boolean")
          } else {
            emit(UnmatchedShape(bodyTrail, trail.get))
          }
        }
        case _ => {
          emit(UnmatchedShape(bodyTrail, trail.get))
        }
      }

    }
  }

  override val primitiveVisitor = new DiffPrimitiveVisitor(emit)
}
