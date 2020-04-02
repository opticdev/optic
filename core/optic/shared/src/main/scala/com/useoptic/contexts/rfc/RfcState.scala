package com.useoptic.contexts.rfc

import com.useoptic.contexts.requests.RequestsState
import com.useoptic.contexts.shapes.ShapesState

import scala.collection.immutable.ListMap
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

object RfcState {
  def empty = RfcState(
    RequestsState(Map.empty, Map.empty, Map.empty, Map.empty, Map.empty),
    ShapesState(Map.empty, Map.empty, Map.empty, ListMap.empty, Map.empty),
    ScmState(Map.empty)
  )
}
