package com.seamless.changelog

import com.seamless.changelog.Changelog.{AddedRequest, Change, RemovedRequest}
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
  /*
  Considerations:
  - This approach to generating the changelog relies on IDs to diff the high level components of the API
    Paths, requests, responses. It will produce a semantic changelog when using a common history, but
    can not be applied to two similar API specs with different underlying IDs

   - An alternative approach would be to rig the logic at this level to do a full diff between
     paths, requests, and possible responses, but the use case for that is less obvious, and would
     probably be better approached by running example requests from one API against another's spec
   */

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
      pathsWithRequestsHistorical,
      pathsWithRequestsHead,
      historicalState,
      headState,
      history,
      events
    )
  }

  def generate(changelogInput: ChangelogInput) = {
    val addedPaths = computeAddedPaths(changelogInput)
    val updatedPaths = computeUpdatedPaths(changelogInput)

    val markdown = new ChangelogMarkdown(addedPaths, updatedPaths, changelogInput).toString

    Changelog(addedPaths, Vector(), updatedPaths, markdown)
  }

  def computeUpdatedPaths(changelogInput: ChangelogInput): Map[RequestId, Vector[Change]] = {
    //only those that were present in both
    val requestsToCompare = (changelogInput.headPaths.keySet intersect changelogInput.historicalPaths.keySet).toVector
    requestsToCompare.map {
      case requestId: RequestId => {
        val previous = RequestChangeHelper(requestId, changelogInput.historicalState)
        val current = RequestChangeHelper(requestId, changelogInput.headState)
        requestId -> CalculateRequestChangelog.requestDiff(previous, current)(changelogInput)
      }
    }.toMap
  }

  def computeAddedPaths(changelogInput: ChangelogInput): Vector[AddedRequest] = {
    val added = (changelogInput.historicalPaths.keySet added changelogInput.headPaths.keySet).toVector

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

  def computeRemovedPaths(changelogInput: ChangelogInput): Vector[RemovedRequest] = {
    val removed = (changelogInput.historicalPaths.keySet removed changelogInput.headPaths.keySet).toVector
    implicit val pathComponents: Map[PathComponentId, PathComponent] = changelogInput.headState.requestsState.pathComponents
    removed.map {
      case requestId => {
        val method = changelogInput.headState.requestsState.requests(requestId).requestDescriptor.httpMethod
        val absolutePath = Utilities.toAbsolutePath(changelogInput.headPaths(requestId))
        Changelog.RemovedRequest(absolutePath, method, requestId)
      }
    }
  }


}
