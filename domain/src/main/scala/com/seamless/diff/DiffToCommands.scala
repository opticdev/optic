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
  @JSExportAll
  case class DiffInterpretation(description: String, commands: Seq[RfcCommand], metadata: Json = null)

  val placeHolder = DiffInterpretation("", Seq.empty)

  def interpret(diff: RequestDiffResult): DiffInterpretation = {
    implicit val shapesState: ShapesState = _shapesState
    diff match {
      case d: NoDiff => DiffInterpretation("", Seq.empty)
      case d: UnmatchedUrl => DiffInterpretation("", Seq.empty)
      case d: UnmatchedHttpMethod => {
        DiffInterpretation(
          s"Add a ${d.method} request",
          Seq(
            AddRequest(RequestsServiceHelper.newRequestId(), d.pathId, d.method)
          )
        )
      }
      case d: UnmatchedHttpStatusCode => {
        DiffInterpretation(
          s"Add a ${d.statusCode} response",
          Seq(
            AddResponse(RequestsServiceHelper.newResponseId(), d.requestId, d.statusCode)
          )
        )
      }
      case d: UnmatchedResponseContentType => {
        DiffInterpretation(
          s"Change the response content type",
          Seq(
            SetResponseContentType(d.responseId, d.contentType)
          )
        )
      }
      case d: UnmatchedResponseBodyShape => {
        val inlineShapeId = ShapesHelper.newShapeId()
        d.shapeDiff match {
          case sd: ShapeDiffer.UnsetShape => {
            val shape = new ShapeBuilder(sd.actual).run
            val inlineShapeId = shape.rootShapeId
            DiffInterpretation(
              s"Change the response body shape",
              shape.commands ++ Seq (
                  SetResponseBodyShape(d.responseId, ShapedBodyDescriptor(d.contentType, inlineShapeId, isRemoved = false))
              ),
              Json.fromJsonObject(JsonObject("shapeIdToName" -> Json.fromString(inlineShapeId)))
            )
          }

          case sd: ShapeDiffer.ShapeMismatch => placeHolder
          case sd: ShapeDiffer.MissingObjectKey => placeHolder
          case sd: ShapeDiffer.ExtraObjectKey => {
            val fieldId = ShapesHelper.newFieldId()
            DiffInterpretation(
              s"Add a field to the response",
              Seq(
                AddField(fieldId, sd.parentObjectShapeId, sd.key, FieldShapeFromShape(fieldId, "$string"))
              )
            )
          }
          case sd: ShapeDiffer.KeyShapeMismatch => {
            //@TODO: factor this out into an injected shapeResolver so we can match concepts, etc.
            val newShapeId = ShapeDiffer.resolveJsonToShapeId(sd.actual)
            DiffInterpretation(
              s"Change the shape of the field",
              Seq(
                SetFieldShape(FieldShapeFromShape(sd.fieldId, newShapeId))
              )
            )
          }
          case sd: ShapeDiffer.MultipleInterpretations => placeHolder
        }

      }
      case d: NoDiff => {
        DiffInterpretation("", Seq.empty)
      }
      case _ => {
        println("unhandled")
        DiffInterpretation("", Seq.empty)

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
