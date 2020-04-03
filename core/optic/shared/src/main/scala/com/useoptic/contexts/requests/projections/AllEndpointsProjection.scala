package com.useoptic.contexts.requests.projections

import com.useoptic.contexts.requests.Commands.PathComponentId
import com.useoptic.contexts.rfc.RfcState

import scala.scalajs.js.annotation.JSExportAll

object AllEndpointsProjection {

  @JSExportAll
  case class Endpoint(pathId: PathComponentId, method: String)

  def fromRfcState(rfcState: RfcState): Seq[Endpoint] = {

    val allRequests = rfcState.requestsState.requests.collect {
      case (id, request) if !request.isRemoved => request
    }


    val allResponses = rfcState.requestsState.responses.collect {
      case (id, response) if !response.isRemoved => response
    }

    val allPathMethodPairs = (allRequests.collect { case i => (i.requestDescriptor.httpMethod, i.requestDescriptor.pathComponentId) } ++ allResponses.collect { case i => (i.responseDescriptor.httpMethod, i.responseDescriptor.pathId) }).toSet

    allPathMethodPairs.map {
      case (method, pathId) => Endpoint(pathId, method)
    }.toSeq.sortBy(_.pathId)
  }

}
