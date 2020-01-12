package com.seamless.diff.interpreters

import com.seamless.contexts.shapes._
import com.seamless.diff.RequestDiffer._
import com.seamless.diff.{DiffInterpretation, InterpretationContext, Interpretations, ShapeDiffer}

class BasicDiffInterpreter(_shapesState: ShapesState) extends Interpreter[RequestDiffResult] {

  def interpret(diff: RequestDiffResult): Seq[DiffInterpretation] = {
    implicit val shapesState: ShapesState = _shapesState
    diff match {
//      case d: UnmatchedHttpMethod => Seq(Interpretations.AddRequest(d.interaction.apiRequest.method, d.pathId))
      case d: UnmatchedHttpStatusCode => Seq(Interpretations.AddResponse(d.interaction.apiResponse.statusCode, d.requestId))
      case d: UnmatchedRequestContentType => Seq(Interpretations.ChangeRequestContentType(d.requestId, d.contentType, d.previousContentType))
      case d: UnmatchedRequestBodyShape => {
        d.shapeDiff match {
          case sd: ShapeDiffer.UnsetShape =>
            Seq(Interpretations.AddInitialRequestBodyShape(sd.actual, d.requestId, d.contentType))
          case sd: ShapeDiffer.UnexpectedObjectKey =>
            Seq(Interpretations.AddFieldToRequestShape(sd.key, sd.actual, sd.parentObjectShapeId, d.requestId))
          case sd: ShapeDiffer.KeyShapeMismatch =>
            Seq(Interpretations.ChangeFieldInRequestShape(sd.key, sd.fieldId, sd.actual, d.requestId))
          case sd: ShapeDiffer.UnsetObjectKey =>
            Seq(Interpretations.DeleteField(sd.key, sd.fieldId, InterpretationContext(None, true)))
          case _ => Seq.empty
        }
      }

      case d: UnmatchedResponseContentType =>
        Seq(Interpretations.ChangeResponseContentType(d.statusCode, d.responseId, d.contentType, d.previousContentType))

      case d: UnmatchedResponseBodyShape => {
        d.shapeDiff match {
          case sd: ShapeDiffer.UnsetShape =>
            Seq(Interpretations.AddInitialResponseBodyShape(sd.actual, d.responseStatusCode, d.responseId, d.contentType))
          case sd: ShapeDiffer.UnexpectedObjectKey =>
            Seq(Interpretations.AddFieldToResponseShape(sd.key, sd.actual, sd.parentObjectShapeId, d.responseStatusCode, d.responseId))
          case sd: ShapeDiffer.KeyShapeMismatch =>
            Seq(Interpretations.ChangeFieldInResponseShape(sd.key, sd.fieldId, sd.actual, d.responseStatusCode, d.responseId))
          case sd: ShapeDiffer.UnsetObjectKey =>
            Seq(Interpretations.DeleteField(sd.key, sd.fieldId, InterpretationContext(Some(d.responseId), false)))
          case _ => Seq.empty
        }
      }

      case _ => Seq.empty
    }
  }
}
