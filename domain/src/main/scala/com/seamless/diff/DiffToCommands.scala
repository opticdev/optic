package com.seamless.diff

import com.seamless.contexts.requests.Commands._
import com.seamless.contexts.requests.RequestsServiceHelper
import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.contexts.shapes.Commands._
import com.seamless.contexts.shapes.{ShapesHelper, ShapesState}
import com.seamless.diff.RequestDiffer._
import com.seamless.diff.ShapeDiffer.ShapeDiffResult
import com.seamless.diff.initial.ShapeBuilder
import io.circe.{Json, JsonObject}

import scala.scalajs.js.annotation.{JSExport, JSExportAll}


@JSExport
@JSExportAll
class DiffToCommands(_shapesState: ShapesState) {

  val placeHolder = DiffInterpretation("placeholder", "", Seq.empty)

  def interpret(diff: RequestDiffResult): DiffInterpretation = {
    implicit val shapesState: ShapesState = _shapesState
    diff match {
      case d: NoDiff => placeHolder
      case d: UnmatchedUrl => placeHolder
      case d: UnmatchedHttpMethod => Interpretations.AddRequest(d.method, d.pathId)
      case d: UnmatchedHttpStatusCode => Interpretations.AddResponse(d.statusCode, d.requestId)
      case d: UnmatchedResponseContentType => Interpretations.ChangeResponseContentType(d.inStatusCode, d.responseId, d.contentType, d.previousContentType)

      case d: UnmatchedResponseBodyShape => {
        val inlineShapeId = ShapesHelper.newShapeId()
        d.shapeDiff match {
          case sd: ShapeDiffer.UnsetShape =>
            Interpretations.AddInitialBodyShape(sd.actual, d.responseStatusCode, d.responseId, d.contentType)

          case sd: ShapeDiffer.ShapeMismatch => placeHolder
          case sd: ShapeDiffer.MissingObjectKey => placeHolder
          case sd: ShapeDiffer.ExtraObjectKey =>
            Interpretations.AddFieldToShape(sd.key, sd.parentObjectShapeId, d.responseStatusCode, d.responseId)
          case sd: ShapeDiffer.KeyShapeMismatch => {
            //@TODO: factor this out into an injected shapeResolver so we can match concepts, etc.
            val newShapeId = ShapeDiffer.resolveJsonToShapeId(sd.actual)
            Interpretations.ChangeFieldShape(sd.key, sd.fieldId, newShapeId, d.responseStatusCode)
          }
          case sd: ShapeDiffer.MultipleInterpretations => placeHolder
        }

      }
      case d: NoDiff => {
        placeHolder
      }
      case _ => {
        println("unhandled")
        placeHolder

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

 */
