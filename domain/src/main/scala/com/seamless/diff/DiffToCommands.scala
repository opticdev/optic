package com.seamless.diff

import com.seamless.contexts.requests.Commands._
import com.seamless.contexts.requests.RequestsServiceHelper
import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.diff.RequestDiffer._

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
object DiffToCommands {
  /*def generateCommands(diff: Seq[ShapeDiffResult]) = {
    // discard interaction is always an option
    // mismatch => oneOf, at root or at exact point?
    // key missing => add, optional, or remove
    // key extra => add, optional, or remove
    // key mismatch => oneOf
  }*/
  def generateCommands(diff: RequestDiffResult): Seq[RfcCommand] = {
    diff match {
      case d: NoDiff => Seq.empty
      case d: UnmatchedUrl => Seq.empty
      case d: UnmatchedHttpMethod => {
        Seq(
          AddRequest(RequestsServiceHelper.newId(), d.pathId, d.method)
        )
      }
      case d: UnmatchedHttpStatusCode => {
        Seq(
          AddResponse(RequestsServiceHelper.newId(), d.requestId, d.statusCode)
        )
      }
    }
  }
}
