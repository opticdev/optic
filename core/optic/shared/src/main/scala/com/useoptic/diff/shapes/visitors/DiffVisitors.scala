package com.useoptic.diff.shapes.visitors

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.ShapeEntity
import com.useoptic.contexts.shapes.ShapesHelper._
import com.useoptic.diff.shapes.{ArrayVisitor, JsonObjectKey, JsonTrail, ObjectVisitor, PrimitiveVisitor, Resolvers, ShapeDiffResult, ShapeTrail, UnmatchedShape, UnspecifiedShape, Visitors}
import io.circe.Json

class DiffVisitors(spec: RfcState) extends Visitors {
  var diffs: Iterator[ShapeDiffResult] = Iterator.empty

  def emit(diff: ShapeDiffResult) = {
    println(s"got diff ${diff}")
    diffs = diffs ++ Iterator(diff)
  }

  class DiffArrayVisitor extends ArrayVisitor {
    override def begin(value: Vector[Json], bodyTrail: JsonTrail, expected: ShapeEntity): Unit = {
      //@TODO: check against the expected shape for fundamental shape mismatch
      println("traversing array")
    }

    override def visit(index: Number, value: Json, bodyTrail: JsonTrail, trail: Option[ShapeTrail]): Unit = {
      println(s"visiting $index")
      println(value)
      println(bodyTrail)
      println(trail)
    }

    override def end(): Unit = {

    }
  }

  override val arrayVisitor: ArrayVisitor = new DiffArrayVisitor()

  class DiffObjectVisitor() extends ObjectVisitor {

    override def begin(value: io.circe.JsonObject, bodyTrail: JsonTrail, expected: ShapeEntity, shapeTrail: ShapeTrail): Unit = {
      println("visiting object")
      //@TODO: check against the expected shape for fundamental shape mismatch
      val fieldNameToId = expected.descriptor.fieldOrdering
        .map(fieldId => {
          val field = spec.shapesState.fields(fieldId)
          (field.descriptor.name -> fieldId)
        }).toMap
      fieldNameToId.foreach(entry => {
        val (fieldName, fieldId) = entry
        if (!value.contains(fieldName)) {
          println(s"object is missing field ${fieldName}")
          emit(UnmatchedShape(bodyTrail.withChild(JsonObjectKey(fieldName)), shapeTrail))
        }
      })
      value.keys.foreach(key => {
        if (!fieldNameToId.contains(key)) {
          println(s"object has extra field ${key}")
          emit(UnspecifiedShape(bodyTrail.withChild(JsonObjectKey(key)), shapeTrail))
        }
      })
    }

    override def visit(key: String, value: Json, bodyTrail: JsonTrail, trail: Option[ShapeTrail]): Unit = {
      println(s"visiting ${key}")
    }

    override def end(): Unit = {
      println("done visiting object")
    }
  }

  override val objectVisitor: ObjectVisitor = new DiffObjectVisitor()
  override val primitiveVisitor: PrimitiveVisitor = new PrimitiveVisitor {
    override def visit(value: Json, bodyTrail: JsonTrail, trail: Option[ShapeTrail]): Unit = {
      println("primitive visitor")
      println(bodyTrail)
      if (trail.isEmpty) {
        throw new Error("did not expect an empty trail")
      }
      val resolvedTrail = Resolvers.resolveTrailToCoreShape(spec, trail.get)
      println(value, trail.get)
      println(resolvedTrail.shapeEntity)
      println(resolvedTrail.coreShapeKind)
      resolvedTrail.coreShapeKind match {
        case NullableKind => {
          if (value.isNull) {
            println("expected null, got null")
          } else {
            //@TODO compare to resolved parameter
            emit(UnmatchedShape(bodyTrail, trail.get))
          }
        }
        case StringKind => {
          if (value.isString) {
            println("expected string, got string")
          } else {
            emit(UnmatchedShape(bodyTrail, trail.get))
          }
        }
        case NumberKind => {
          if (value.isNumber) {
            println("expected number, got number")
          } else {
            emit(UnmatchedShape(bodyTrail, trail.get))
          }
        }
        case BooleanKind => {
          if (value.isBoolean) {
            println("expected boolean, got boolean")
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
}