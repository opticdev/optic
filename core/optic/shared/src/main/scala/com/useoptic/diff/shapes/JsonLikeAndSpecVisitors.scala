package com.useoptic.diff.shapes

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.ShapesHelper.{BooleanKind, ListKind, NullableKind, NumberKind, ObjectKind, OptionalKind, StringKind}
import com.useoptic.diff.shapes.JsonTrailPathComponent.JsonObjectKey
import com.useoptic.diff.shapes.Resolvers.ChoiceOutput
import com.useoptic.diff.shapes.Stuff.{ArrayItemChoiceCallback, ObjectKeyChoiceCallback}
import com.useoptic.types.capture.JsonLike

abstract class JlasObjectVisitor {
  def visit(json: JsonLike, jsonTrail: JsonTrail, trailOrigin: ShapeTrail, trailChoices: Seq[ChoiceOutput], itemChoiceCallback: ObjectKeyChoiceCallback)
}

abstract class JlasObjectKeyVisitor {

  def visit(objectJsonTrail: JsonTrail, objectKeys: Map[String, JsonLike], objectChoices: Seq[ChoiceOutput])
}

abstract class JlasArrayVisitor {

  def visit(json: JsonLike, jsonTrail: JsonTrail, trailOrigin: ShapeTrail, trailChoices: Seq[ChoiceOutput], itemChoiceCallback: ArrayItemChoiceCallback)

}

abstract class JlasPrimitiveVisitor {
  def visit(json: JsonLike, jsonTrail: JsonTrail, trailOrigin: ShapeTrail, trailChoices: Seq[ChoiceOutput])
}

abstract class JsonLikeAndSpecVisitors {
  val primitiveVisitor: JlasPrimitiveVisitor
  val arrayVisitor: JlasArrayVisitor
  val objectVisitor: JlasObjectVisitor
  val objectKeyVisitor: JlasObjectKeyVisitor
}

class JsonLikeAndSpecDiffPrimitiveVisitor(emit: Function[ShapeDiffResult, Any], markShapeTrailAsVisited: Function[ShapeTrail, Any]) extends JlasPrimitiveVisitor {
  override def visit(json: JsonLike, jsonTrail: JsonTrail, trailOrigin: ShapeTrail, trailChoices: Seq[ChoiceOutput]): Unit = {
    if (trailChoices.isEmpty) {
      emit(UnspecifiedShape(jsonTrail, trailOrigin))
      return
    }
    val choicesGroupedByMatch = (
      if (json.isBoolean) {
        trailChoices.groupBy(choice => {
          choice.coreShapeKind match {
            case BooleanKind => true
            case _ => false
          }
        })
      }
      else if (json.isNumber) {
        trailChoices.groupBy(choice => {
          choice.coreShapeKind match {
            case NumberKind => true
            case _ => false
          }
        })
      }
      else if (json.isString) {
        trailChoices.groupBy(choice => {
          choice.coreShapeKind match {
            case StringKind => true
            case _ => false
          }
        })
      }
      else if (json.isNull) {
        trailChoices.groupBy(choice => {
          choice.coreShapeKind match {
            case NullableKind => true
            case _ => false
          }
        })
      }
      else {
        throw new Error("expected json to be a boolean, number, string, or null")
      }
      )
    val matched = choicesGroupedByMatch.getOrElse(true, Seq.empty)

    if (matched.isEmpty) {
      val unmatched = choicesGroupedByMatch.getOrElse(false, Seq.empty)
      unmatched.foreach(choice => {
        emit(UnmatchedShape(jsonTrail, choice.shapeTrail()))
      })
    }
  }
}

class JsonLikeAndSpecDiffObjectVisitor(spec: RfcState, emit: Function[ShapeDiffResult, Any], markShapeTrailAsVisited: Function[ShapeTrail, Any]) extends JlasObjectVisitor {

  override def visit(json: JsonLike, jsonTrail: JsonTrail, trailOrigin: ShapeTrail, trailChoices: Seq[ChoiceOutput], itemChoiceCallback: ObjectKeyChoiceCallback): Unit = {
    if (trailChoices.isEmpty) {
      emit(UnspecifiedShape(jsonTrail, trailOrigin))
      itemChoiceCallback(Seq.empty, _ => Seq.empty)
      return
    }

    // json-object-specific
    val choicesGroupedByMatch = trailChoices.groupBy(choice => {
      choice.coreShapeKind match {
        case ObjectKind => true
        //@TODO: support case MapKind
        case _ => false
      }
    })

    val matched = choicesGroupedByMatch.getOrElse(true, Seq.empty)

    if (matched.isEmpty) {
      val unmatched = choicesGroupedByMatch.getOrElse(false, Seq.empty)
      unmatched.foreach(choice => {
        emit(UnmatchedShape(jsonTrail, choice.shapeTrail()))
      })
    }

    // json-object-specific
    val matchedWithChoices = (key: String) => matched.flatMap(choice => {
      choice.coreShapeKind match {
        case ObjectKind => {
          val objectTrail = choice.shapeTrail()
          val o = spec.shapesState.shapes(choice.shapeId)

          val keyToField = o.descriptor.fieldOrdering
            .flatMap(fieldId => {
              val field = spec.shapesState.fields(fieldId)
              if (field.isRemoved) {
                None
              } else {
                val (_, fieldShapeEntity) = Resolvers.resolveFieldToShapeEntity(spec.shapesState, fieldId, Map.empty)
                val shapeId = fieldShapeEntity.get.shapeId
                Some(field.descriptor.name -> (fieldId, shapeId))
              }
            })
            .toMap

          keyToField.get(key) match {
            case Some(x) => {
              val (fieldId, shapeId) = x
              val keyTrail = objectTrail.withChildren(ObjectFieldTrail(fieldId, shapeId))
              val choices = Resolvers.listTrailChoices(spec, keyTrail, Map.empty)
              choices
            }
            case None => Seq.empty
          }
        }
        //@TODO: support case MapKind
        case _ => throw new Error("expected choice to be ObjectKind")
      }
    })
    itemChoiceCallback(matched, matchedWithChoices)
  }
}

class JsonLikeAndSpecDiffArrayVisitor(spec: RfcState, emit: Function[ShapeDiffResult, Any], markShapeTrailAsVisited: Function[ShapeTrail, Any]) extends JlasArrayVisitor {
  override def visit(json: JsonLike, jsonTrail: JsonTrail, trailOrigin: ShapeTrail, trailChoices: Seq[ChoiceOutput], itemChoiceCallback: ArrayItemChoiceCallback): Unit = {
    if (trailChoices.isEmpty) {
      emit(UnspecifiedShape(jsonTrail, trailOrigin))
      itemChoiceCallback(Seq.empty)
      return
    }
    // json-array-specific
    val choicesGroupedByMatch = trailChoices.groupBy(choice => {
      choice.coreShapeKind match {
        case ListKind => true
        case _ => false
      }
    })

    val matched = choicesGroupedByMatch.getOrElse(true, Seq.empty)

    if (matched.isEmpty) {
      val unmatched = choicesGroupedByMatch.getOrElse(false, Seq.empty)
      unmatched.foreach(choice => {
        emit(UnmatchedShape(jsonTrail, choice.shapeTrail()))
      })
    }

    // json-array-specific
    val matchedWithChoices = matched.flatMap(choice => {
      choice.coreShapeKind match {
        case ListKind => {
          val listTrail = choice.shapeTrail()
          Resolvers.resolveParameterToShape(spec.shapesState, choice.shapeId, ListKind.innerParam, Map.empty).map(listItem => {
            val listItemTrail = listTrail.withChild(ListItemTrail(choice.shapeId, listItem.shapeId))
            val choices = Resolvers.listTrailChoices(spec, listItemTrail, Map.empty)
            choices
          }).getOrElse(Seq.empty)
        }
        case _ => throw new Error("expected choice to be ListKind")
      }
    })
    itemChoiceCallback(matchedWithChoices)
  }
}

class JsonLikeAndSpecDiffObjectKeyVisitor(spec: RfcState, emit: Function[ShapeDiffResult, Any], markShapeTrailAsVisited: Function[ShapeTrail, Any]) extends JlasObjectKeyVisitor {
  override def visit(objectJsonTrail: JsonTrail, objectKeys: Map[String, JsonLike], objectChoices: Seq[ChoiceOutput]): Unit = {
    objectChoices.foreach(choice => {
      choice.coreShapeKind match {
        case ObjectKind => {
          val objectTrail = choice.shapeTrail()
          val o = spec.shapesState.shapes(choice.shapeId)

          val keyToField = o.descriptor.fieldOrdering
            .flatMap(fieldId => {
              val field = spec.shapesState.fields(fieldId)
              if (field.isRemoved) {
                None
              } else {
                val (_, fieldShapeEntity) = Resolvers.resolveFieldToShapeEntity(spec.shapesState, fieldId, Map.empty)
                val shapeId = fieldShapeEntity.get.shapeId
                Some(field.descriptor.name -> (fieldId, shapeId))
              }
            })
            .toMap

          keyToField.keys.foreach(key => {
            if (!objectKeys.contains(key)) {
              val (fieldId, shapeId) = keyToField(key)
              val fieldTrail = objectTrail.withChild(ObjectFieldTrail(fieldId, shapeId))
              val fieldCoreShape = Resolvers.resolveTrailToCoreShape(spec, fieldTrail, Map.empty)
              fieldCoreShape.coreShapeKind match {
                case OptionalKind => {
                  // it's ok for optional things to be omitted
                }
                case _ => {
                  val keyJsonTrail = objectJsonTrail.withChild(JsonObjectKey(key))
                  emit(UnmatchedShape(keyJsonTrail, fieldTrail))
                }
              }
            }
          })
        }
        //@TODO: support case MapKind
        case _ => throw new Error("expected choice to be ObjectKind")
      }
    })
  }
}

object Stuff {
  type ObjectKeyChoiceCallback = (Seq[ChoiceOutput], Function[String, Seq[ChoiceOutput]]) => Any
  type ArrayItemChoiceCallbackInput = Seq[ChoiceOutput]
  type ArrayItemChoiceCallback = Function[ArrayItemChoiceCallbackInput, Any]
  type ChoiceResolver = Function[ShapeTrail, Seq[ChoiceOutput]]
}

class JsonLikeAndSpecDiffVisitors(spec: RfcState, emit: Function[ShapeDiffResult, Any], markShapeTrailAsVisited: Function[ShapeTrail, Any]) extends JsonLikeAndSpecVisitors {
  override val primitiveVisitor: JlasPrimitiveVisitor = new JsonLikeAndSpecDiffPrimitiveVisitor(emit, markShapeTrailAsVisited)
  override val arrayVisitor: JlasArrayVisitor = new JsonLikeAndSpecDiffArrayVisitor(spec, emit, markShapeTrailAsVisited)
  override val objectVisitor: JlasObjectVisitor = new JsonLikeAndSpecDiffObjectVisitor(spec, emit, markShapeTrailAsVisited)
  override val objectKeyVisitor: JlasObjectKeyVisitor = new JsonLikeAndSpecDiffObjectKeyVisitor(spec, emit, markShapeTrailAsVisited)
}
