package com.seamless.diff.interpreters

import com.seamless.contexts.shapes.ShapesHelper._
import com.seamless.contexts.shapes._
import com.seamless.diff.RequestDiffer._
import com.seamless.diff.initial._
import com.seamless.diff.{DiffInterpretation, Interpretations, ShapeDiffer}

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
class BasicDiffInterpreter(_shapesState: ShapesState) extends Interpreter {

  def interpret(diff: RequestDiffResult): Seq[DiffInterpretation] = {
    implicit val shapesState: ShapesState = _shapesState
    diff match {
      case d: UnmatchedHttpMethod => Seq(Interpretations.AddRequest(d.method, d.pathId))
      case d: UnmatchedHttpStatusCode => Seq(Interpretations.AddResponse(d.statusCode, d.requestId))
      case d: UnmatchedRequestContentType => Seq(Interpretations.ChangeRequestContentType(d.requestId, d.contentType, d.previousContentType))
      case d: UnmatchedRequestBodyShape => {
        d.shapeDiff match {
          case sd: ShapeDiffer.UnsetShape => Seq(Interpretations.AddInitialRequestBodyShape(sd.actual, d.requestId, d.contentType))
          case sd: ShapeDiffer.UnexpectedObjectKey => Seq(Interpretations.AddFieldToRequestShape(sd.key, sd.actual, sd.parentObjectShapeId, d.requestId))
          case sd: ShapeDiffer.KeyShapeMismatch => {
            val newShapeId = ShapeResolver.resolveJsonToShapeId(sd.actual).getOrElse(AnyKind.baseShapeId)
            Seq(Interpretations.ChangeFieldInRequestShape(sd.key, sd.fieldId, newShapeId, d.requestId))
          }
          case _ => Seq.empty
        }
      }
      case d: UnmatchedResponseContentType => Seq(Interpretations.ChangeResponseContentType(d.statusCode, d.responseId, d.contentType, d.previousContentType))

      case d: UnmatchedResponseBodyShape => {
        d.shapeDiff match {
          case sd: ShapeDiffer.UnsetShape =>
            Seq(Interpretations.AddInitialResponseBodyShape(sd.actual, d.responseStatusCode, d.responseId, d.contentType))

          case sd: ShapeDiffer.UnexpectedObjectKey =>
            Seq(Interpretations.AddFieldToResponseShape(sd.key, sd.actual, sd.parentObjectShapeId, d.responseStatusCode, d.responseId))
          case sd: ShapeDiffer.KeyShapeMismatch => {
            val newShapeId = ShapeResolver.resolveJsonToShapeId(sd.actual).getOrElse(AnyKind.baseShapeId)
            Seq(Interpretations.ChangeFieldInResponseShape(sd.key, sd.fieldId, newShapeId, d.responseStatusCode))
          }
          case _ => Seq.empty
        }

      }
    }
  }
}