package com.useoptic.diff.interactions.interpreters

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.Commands.{AddField, FieldShapeFromShape, ProviderInShape, SetParameterShape, ShapeProvider}
import com.useoptic.contexts.shapes.{ShapesAggregate, ShapesHelper}
import com.useoptic.contexts.shapes.ShapesHelper.{ListKind, ObjectKind, UnknownKind}
import com.useoptic.diff.initial.DistributionAwareShapeBuilder
import com.useoptic.diff.{ChangeType, InteractiveDiffInterpretation}
import com.useoptic.diff.interactions.{InteractionDiffResult, InteractionTrail, UnmatchedRequestBodyShape, UnmatchedResponseBodyShape}
import com.useoptic.diff.interpreters.InteractiveDiffInterpreter
import com.useoptic.diff.shapes.JsonTrailPathComponent.JsonObjectKey
import com.useoptic.diff.shapes._
import com.useoptic.diff.shapes.resolvers.{JsonLikeResolvers, ShapesResolvers}
import com.useoptic.dsa.OpticDomainIds
import com.useoptic.logging.Logger
import com.useoptic.types.capture.HttpInteraction

class UnspecifiedShapeDiffInterpreter(resolvers: ShapesResolvers, rfcState: RfcState)(implicit ids: OpticDomainIds) extends InteractiveDiffInterpreter[InteractionDiffResult] {
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
    val resolved = resolvers.resolveTrailToCoreShape(shapeDiff.shapeTrail, Map.empty) //@TODO: check bindings
    Logger.log("sentinel-interpretUnspecifiedShape")
    Logger.log(resolved.shapeEntity)
    Logger.log(resolved.coreShapeKind)
    resolved.coreShapeKind match {
      case ListKind => {
        val json = JsonLikeResolvers.tryResolveJsonLike(interactionTrail, shapeDiff.jsonTrail, interaction)
        val (inlineShapeId, newCommands) = DistributionAwareShapeBuilder.toCommands(Vector(json.get))
        val commands = newCommands.flatten ++ Seq(
          SetParameterShape(
            ProviderInShape(
              resolved.shapeEntity.shapeId,
              ShapeProvider(inlineShapeId),
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
        val json = JsonLikeResolvers.tryResolveJsonLike(interactionTrail, shapeDiff.jsonTrail, interaction)
        Logger.log(json.get)
        val key = shapeDiff.jsonTrail.path.last.asInstanceOf[JsonObjectKey].key
        val (inlineShapeId, newCommands) = DistributionAwareShapeBuilder.toCommands(Vector(json.get))

        val fieldId = ids.newFieldId
        val commands = newCommands.flatten ++ Seq(
          AddField(fieldId, resolved.shapeEntity.shapeId, key, FieldShapeFromShape(fieldId, inlineShapeId))
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
