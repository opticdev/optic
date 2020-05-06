package com.useoptic.diff.interactions.interpreters

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.Commands.{AddField, FieldShapeFromShape, ProviderInShape, SetBaseShape, SetParameterShape, ShapeProvider}
import com.useoptic.contexts.shapes.{ShapesAggregate, ShapesHelper}
import com.useoptic.contexts.shapes.ShapesHelper.{ListKind, ObjectKind, UnknownKind}
import com.useoptic.diff.{ChangeType, InteractiveDiffInterpretation}
import com.useoptic.diff.initial.ShapeBuilder
import com.useoptic.diff.interactions.{InteractionDiffResult, InteractionTrail, UnmatchedRequestBodyShape, UnmatchedResponseBodyShape}
import com.useoptic.diff.interpreters.InteractiveDiffInterpreter
import com.useoptic.diff.shapes.JsonTrailPathComponent.JsonObjectKey
import com.useoptic.diff.shapes.{Resolvers, UnspecifiedShape}
import com.useoptic.logging.Logger
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
    Logger.log("sentinel-interpretUnspecifiedShape")
    Logger.log(resolved.shapeEntity)
    Logger.log(resolved.coreShapeKind)
    resolved.coreShapeKind match {
      case ListKind => {
        val json = Resolvers.tryResolveJsonLike(interactionTrail, shapeDiff.jsonTrail, interaction)
        val builtShape = new ShapeBuilder(json.get)(ShapesAggregate.initialState).run
        val commands = builtShape.commands ++ Seq(
          SetParameterShape(
            ProviderInShape(
              resolved.shapeEntity.shapeId,
              ShapeProvider(builtShape.rootShapeId),
              ListKind.innerParam
            )
          )
        )
        Seq(
          InteractiveDiffInterpretation(
            s"Set the shape",
            s"Set the shape to ...",
            commands,
            ChangeType.Addition
          )
        )
      }

      case ObjectKind => {
        Logger.log(shapeDiff.jsonTrail)
        val json = Resolvers.tryResolveJsonLike(interactionTrail, shapeDiff.jsonTrail, interaction)
        Logger.log(json.get)
        val key = shapeDiff.jsonTrail.path.last.asInstanceOf[JsonObjectKey].key
        val builtShape = new ShapeBuilder(json.get)(ShapesAggregate.initialState).run
        val fieldId = ShapesHelper.newFieldId()
        val commands = builtShape.commands ++ Seq(
          AddField(fieldId, resolved.shapeEntity.shapeId, key, FieldShapeFromShape(fieldId, builtShape.rootShapeId))
        )
        Seq(
          InteractiveDiffInterpretation(
            s"Add ${key}",
            s"Add ${key} to the specification",
            commands,
            ChangeType.Addition
          )
        )
      }
      //@TODO: support Nullable<Unknown> (when you have only seen null and then see something else)
      case _ => Seq.empty
    }
  }

  override def interpret(diff: InteractionDiffResult, interactions: Vector[HttpInteraction]): Seq[InteractiveDiffInterpretation] = interpret(diff, interactions.head)
}
