package com.useoptic.diff.interactions.interpreters

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.diff.interactions.interpretations.BasicInterpretations
import com.useoptic.diff.{ChangeType, InteractiveDiffInterpretation}
import com.useoptic.diff.interactions.{InteractionDiffResult, InteractionTrail, RequestSpecTrail, UnmatchedRequestBodyShape, UnmatchedResponseBodyShape}
import com.useoptic.diff.interpreters.InteractiveDiffInterpreter
import com.useoptic.diff.shapes.{JsonTrail, Resolvers, ShapeTrail, UnmatchedShape}
import com.useoptic.types.capture.HttpInteraction

class MissingValueInterpreter(rfcState: RfcState) extends InteractiveDiffInterpreter[InteractionDiffResult] {
  override def interpret(diff: InteractionDiffResult, interaction: HttpInteraction): Seq[InteractiveDiffInterpretation] = {
    diff match {
      case d: UnmatchedRequestBodyShape => {
        d.shapeDiffResult match {
          case sd: UnmatchedShape => {
            interpretUnmatchedShape(d.interactionTrail, d.requestsTrail, sd.jsonTrail, sd.shapeTrail, interaction)
          }
          case _ => Seq.empty
        }
      }
      case d: UnmatchedResponseBodyShape => {
        d.shapeDiffResult match {
          case sd: UnmatchedShape => {
            interpretUnmatchedShape(d.interactionTrail, d.requestsTrail, sd.jsonTrail, sd.shapeTrail, interaction)
          }
          case _ => Seq.empty

        }
      }
      case _ => Seq.empty
    }
  }

  def interpretUnmatchedShape(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail, jsonTrail: JsonTrail, shapeTrail: ShapeTrail, interaction: HttpInteraction): Seq[InteractiveDiffInterpretation] = {
    val resolved = Resolvers.tryResolveJson(interactionTrail, jsonTrail, interaction)
    if (resolved.isEmpty) {
      // remove from spec or make optional
      Seq(
        InteractiveDiffInterpretation(
          "resolved is empty",
          "xxx",
          Seq.empty,
          ChangeType.Addition
        )
      )
    } else {
      // change shape
      Seq(
        new BasicInterpretations(rfcState).ChangeShape(interactionTrail, requestsTrail, shapeTrail, jsonTrail, interaction)
      )
    }

  }
}
