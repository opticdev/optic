package com.useoptic.diff.interactions.interpreters

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.Commands.{AddField, FieldShapeFromShape}
import com.useoptic.contexts.shapes.{ShapesAggregate, ShapesHelper}
import com.useoptic.contexts.shapes.ShapesHelper.ObjectKind
import com.useoptic.diff.InteractiveDiffInterpretation
import com.useoptic.diff.initial.ShapeBuilder
import com.useoptic.diff.interactions.{InteractionDiffResult, InteractionTrail, UnmatchedRequestBodyShape, UnmatchedResponseBodyShape}
import com.useoptic.diff.interpreters.InteractiveDiffInterpreter
import com.useoptic.diff.shapes.{JsonObjectKey, Resolvers, UnspecifiedShape}
import com.useoptic.types.capture.HttpInteraction

class UnspecifiedShapeDiffInterpreter(rfcState: RfcState) extends InteractiveDiffInterpreter[InteractionDiffResult] {
  override def interpret(diff: InteractionDiffResult, interaction: HttpInteraction): Seq[InteractiveDiffInterpretation] = {
    diff match {
      case d: UnmatchedRequestBodyShape => {
        d.shapeDiffResult match {
          case sd: UnspecifiedShape => {
            interpretUnspecifiedShape(d.interactionTrail, sd, interaction)
          }
          case _ => Seq.empty
        }

      }
      case d: UnmatchedResponseBodyShape => {
        d.shapeDiffResult match {
          case sd: UnspecifiedShape => {
            interpretUnspecifiedShape(d.interactionTrail, sd, interaction)
          }
          case _ => Seq.empty
        }
      }
      case _ => Seq.empty
    }
  }

  def interpretUnspecifiedShape(interactionTrail: InteractionTrail, shapeDiff: UnspecifiedShape, interaction: HttpInteraction) = {
    // if our shapeTrail points to an object and jsonTrail points to a key
    val resolved = Resolvers.resolveTrailToCoreShape(rfcState, shapeDiff.shapeTrail)
    println(resolved.shapeEntity)
    println(resolved.coreShapeKind)
    resolved.coreShapeKind match {
      case ObjectKind => {
        println(shapeDiff.jsonTrail)
        val json = Resolvers.tryResolveJson(interactionTrail, shapeDiff.jsonTrail, interaction)
        println(json.get)
        val key = shapeDiff.jsonTrail.path.last.asInstanceOf[JsonObjectKey].key
        val builtShape = new ShapeBuilder(json.get)(ShapesAggregate.initialState).run
        val fieldId = ShapesHelper.newFieldId()
        val commands = builtShape.commands ++ Seq(
          AddField(fieldId, resolved.shapeEntity.shapeId, key, FieldShapeFromShape(fieldId, builtShape.rootShapeId))
        )
        Seq(
          InteractiveDiffInterpretation(
            "Add key",
            s"Add ${key} to the spec",
            commands
          )
        )
      }
      case _ => Seq()
    }
  }
}
