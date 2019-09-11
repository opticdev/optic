package com.seamless.diff

import com.seamless.contexts.shapes.ShapesHelper._
import com.seamless.contexts.shapes._
import com.seamless.diff.RequestDiffer._
import com.seamless.diff.initial._

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
class DiffToCommands(_shapesState: ShapesState) {

  val placeHolder = DiffInterpretation("You found a bug!", "We're looking into it :)", Seq.empty)

  def interpret(diff: RequestDiffResult): DiffInterpretation = {
    implicit val shapesState: ShapesState = _shapesState
    diff match {
      case d: NoDiff => placeHolder
      case d: UnmatchedUrl => placeHolder
      case d: UnmatchedHttpMethod => Interpretations.AddRequest(d.method, d.pathId)
      case d: UnmatchedHttpStatusCode => Interpretations.AddResponse(d.statusCode, d.requestId)
      case d: UnmatchedRequestContentType => Interpretations.ChangeRequestContentType(d.requestId, d.contentType, d.previousContentType)
      case d: UnmatchedRequestBodyShape => {
        d.shapeDiff match {
          case sd: ShapeDiffer.UnsetShape => Interpretations.AddInitialRequestBodyShape(sd.actual, d.requestId, d.contentType)
          case sd: ShapeDiffer.ShapeMismatch => Interpretations.RequireManualIntervention(s"Make sure the shapes match", Seq(d.requestId))
          case sd: ShapeDiffer.MissingObjectKey => Interpretations.RequireManualIntervention(s"Make sure you intended for the key ${sd.key} to be missing in the request", Seq(d.requestId))
          case sd: ShapeDiffer.ExtraObjectKey => Interpretations.AddFieldToRequestShape(sd.key, sd.actual, sd.parentObjectShapeId, d.requestId)
          case sd: ShapeDiffer.KeyShapeMismatch => {
            val newShapeId = ShapeResolver.resolveJsonToShapeId(sd.actual).getOrElse(AnyKind.baseShapeId)
            Interpretations.ChangeFieldInRequestShape(sd.key, sd.fieldId, newShapeId, d.requestId)
          }
          case _ => placeHolder
        }
      }
      case d: UnmatchedResponseContentType => Interpretations.ChangeResponseContentType(d.statusCode, d.responseId, d.contentType, d.previousContentType)

      case d: UnmatchedResponseBodyShape => {
        d.shapeDiff match {
          case sd: ShapeDiffer.UnsetShape =>
            Interpretations.AddInitialResponseBodyShape(sd.actual, d.responseStatusCode, d.responseId, d.contentType)

          case sd: ShapeDiffer.ShapeMismatch => Interpretations.RequireManualIntervention(s"Make sure the shapes match", Seq(d.responseId))
          case sd: ShapeDiffer.MissingObjectKey => Interpretations.RequireManualIntervention(s"Make sure you intended for the key ${sd.key} to be missing in the response", Seq(d.responseId, sd.parentObjectShapeId))
          case sd: ShapeDiffer.ExtraObjectKey =>
            Interpretations.AddFieldToResponseShape(sd.key, sd.actual, sd.parentObjectShapeId, d.responseStatusCode, d.responseId)
          case sd: ShapeDiffer.KeyShapeMismatch => {
            val newShapeId = ShapeResolver.resolveJsonToShapeId(sd.actual).getOrElse(AnyKind.baseShapeId)
            Interpretations.ChangeFieldInResponseShape(sd.key, sd.fieldId, newShapeId, d.responseStatusCode)
          }
          case _ => placeHolder
        }

      }
    }
  }
}

/*
Plan of Attack
 - what should happen when there is a missing key? (i.e. fix placeholders above)
 - request body, headers, etc. diffing
 - ignoring stuff? (cache in interactionResult / diffState)
 - launch spec with latest session
 - clean up pathmatcher
 - api start should check diff when finishing
 */
