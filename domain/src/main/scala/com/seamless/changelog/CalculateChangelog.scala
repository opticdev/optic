package com.seamless.changelog

import com.seamless.contexts.requests.Commands.{PathComponentId, RequestId, UnsetBodyDescriptor}
import com.seamless.contexts.requests.{PathComponent, RequestsState, Utilities}
import com.seamless.contexts.requests.projections.PathsWithRequestsProjection
import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.contexts.rfc.{RfcAggregate, RfcServiceJSFacade, RfcState}
import com.seamless.contexts.shapes.ShapesState
import com.seamless.ddd.{CachedProjection, EventStore, InMemoryEventStore}
import com.seamless.diff.{RequestDiffer, ShapeDiffer}

import com.seamless.utilities.SetUtilities._
import com.seamless.diff.ShapeDiffer.resolveBaseObject
import com.seamless.diff.initial.ShapeResolver

object CalculateChangelog {

  def prepare(events: Vector[RfcEvent], since: Int): ChangelogInput = {
    val (history, head) = events.splitAt(since)

    val pathsWithRequestsCache = new CachedProjection(PathsWithRequestsProjection, history)

    val pathsWithRequestsHistorical = pathsWithRequestsCache.withEvents(history)
    val pathsWithRequestsHead = pathsWithRequestsCache.withEvents(events)


    val historicalState = history.foldLeft(RfcAggregate.initialState) {
      case (state, event) => RfcAggregate.applyEvent(event, state)
    }

    val headState = head.foldLeft(historicalState) {
      case (state, event) => RfcAggregate.applyEvent(event, state)
    }

    ChangelogInput(
      pathsWithRequestsHistorical, pathsWithRequestsHead,
      historicalState, headState
    )
  }

  def generate(changelogInput: ChangelogInput) = {
    computeAddedPaths(changelogInput)
  }

  def computeAddedPaths(changelogInput: ChangelogInput): Set[Changelog.AddedRequest] = {
    val added = changelogInput.historicalPaths.keySet added changelogInput.headPaths.keySet

    implicit val pathComponents: Map[PathComponentId, PathComponent] = changelogInput.headState.requestsState.pathComponents

    added.map {
      case requestId => {
        //@todo handled is removed
        val method = changelogInput.headState.requestsState.requests(requestId).requestDescriptor.httpMethod
        val absolutePath = Utilities.toAbsolutePath(changelogInput.headPaths(requestId))
        Changelog.AddedRequest(absolutePath, method, requestId)
      }
    }
  }


}
