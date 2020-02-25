package com.useoptic.diff.interactions.interpreters

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.diff.InteractiveDiffInterpretation
import com.useoptic.diff.interactions.interpretations.BasicInterpretations
import com.useoptic.diff.interactions._
import com.useoptic.diff.interpreters.InteractiveDiffInterpreter
import com.useoptic.diff.shapes.{UnmatchedShape, UnspecifiedShape}
import com.useoptic.types.capture.HttpInteraction

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
class BasicInterpreters(rfcState: RfcState) extends InteractiveDiffInterpreter[InteractionDiffResult] {
  override def interpret(diff: InteractionDiffResult, interaction: HttpInteraction): Seq[InteractiveDiffInterpretation] = {
    val interpretations = new BasicInterpretations(rfcState)
    diff match {
      // we handle this in a separate ui so it should not get to the diff ui
      case d: UnmatchedRequestUrl => Seq.empty
      // we handle this in a separate ui so it should not get to the diff ui
      case d: UnmatchedRequestMethod => Seq.empty
      case d: UnmatchedResponseStatusCode => Seq(
        interpretations.AddResponse(d.interactionTrail, d.requestsTrail)
      )
      case d: UnmatchedRequestBodyContentType => Seq(
        interpretations.AddRequestContentType(d.interactionTrail, d.requestsTrail)
      )
      case d: UnmatchedRequestBodyShape => {
        d.shapeDiffResult match {
          case sd: UnspecifiedShape => {
            println("UnmatchedRequestBodyShape -> UnspecifiedShape")
            println(d)
            println(sd)
            println(interaction)
            if (sd.jsonTrail.path.isEmpty) {
              Seq(
                interpretations.SetRequestBodyShape(d.interactionTrail, d.requestsTrail, interaction)
              )
            } else {
              Seq(
                //@TODO: AddField
              )
            }
          }
          case sd: UnmatchedShape => {
            Seq(
              interpretations.ChangeShape(d.interactionTrail, d.requestsTrail, sd.shapeTrail, sd.jsonTrail, interaction)
            )
          }
          case _ => Seq.empty
        }
      }
      case d: UnmatchedResponseBodyContentType => Seq(
        interpretations.ChangeResponseContentType(d.interactionTrail, d.requestsTrail)
      )
      case d: UnmatchedResponseBodyShape => {
        d.shapeDiffResult match {
          case sd: UnspecifiedShape => {
            if (sd.jsonTrail.path.isEmpty) {
              Seq(
                interpretations.SetResponseBodyShape(d.interactionTrail, d.requestsTrail, interaction)
              )
            } else {
              Seq(
                //@TODO: AddField
              )
            }
          }
          case sd: UnmatchedShape => {
            Seq(
              interpretations.ChangeShape(d.interactionTrail, d.requestsTrail, sd.shapeTrail, sd.jsonTrail, interaction)
            )
          }
          case _ => Seq.empty
        }
      }
    }
  }
}
