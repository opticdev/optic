package com.seamless.diff

import com.seamless.contexts.requests.Commands._
import com.seamless.contexts.requests.RequestsServiceHelper
import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.contexts.shapes.Commands.AddShape
import com.seamless.contexts.shapes.ShapesHelper
import com.seamless.diff.RequestDiffer._
import com.seamless.diff.ShapeDiffer.ShapeDiffResult

import scala.scalajs.js.annotation.{JSExport, JSExportAll}


@JSExport
@JSExportAll
object DiffToCommands {
  @JSExportAll
  case class DiffInterpretation(description: String, commands: Seq[RfcCommand])
  def generateCommands(diff: ShapeDiffResult) = {
    // discard interaction is always an option
    // mismatch => oneOf, at root or at exact point?
    // key missing => add, optional, or remove
    // key extra => add, optional, or remove
    // key mismatch => oneOf
    diff match {
      case ShapeDiffer.NoDiff() =>
      case ShapeDiffer.ShapeMismatch(expected, actual) =>
      case ShapeDiffer.MissingObjectKey(key) =>
      case ShapeDiffer.ExtraObjectKey(key) =>
      case ShapeDiffer.KeyShapeMismatch(key, expected, actual) =>
      case ShapeDiffer.MultipleInterpretations(s@_*) =>
    }
  }
  def generateCommands(diff: RequestDiffResult): DiffInterpretation = {
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
            AddResponse(RequestsServiceHelper.newRequestId(), d.requestId, d.statusCode)
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
        DiffInterpretation(
          s"Change the response body shape",
          Seq(
            AddShape(inlineShapeId, "$object", ""),
            SetResponseBodyShape(d.responseId, ShapedBodyDescriptor(d.contentType, inlineShapeId, isRemoved = false))
          )
        )
      }
      case d: NoDiff => {
        DiffInterpretation("", Seq.empty)
      }
    }
  }
}
