package com.seamless.contexts.rfc

import com.seamless.contexts.requests.RequestsState
import com.seamless.contexts.shapes.ShapesState

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
case class RfcState(requestsState: RequestsState, shapesState: ShapesState, scmState: ScmState) {
  def updateShapes(shapesState: ShapesState): RfcState = {
    this.copy(shapesState = shapesState)
  }
  def updateRequests(requestsState: RequestsState) = {
    this.copy(requestsState = requestsState)
  }
  def updateScm(scmState: ScmState): RfcState = {
    this.copy(scmState = scmState)
  }
}
