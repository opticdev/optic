package com.useoptic.ux

import com.useoptic.contexts.requests.Commands.PathComponentId
import com.useoptic.contexts.rfc.RfcState
import com.useoptic.diff.helpers.DiffHelpers.InteractionsGroupedByDiff
import com.useoptic.diff.interactions.{InteractionDiffResult, InteractionTrail, RequestSpecTrail, RequestSpecTrailHelpers, Resolvers, SpecPath, SpecRequestBody, SpecRequestRoot, SpecResponseBody, SpecResponseRoot, SpecRoot, UnmatchedRequestBodyContentType, UnmatchedRequestMethod, UnmatchedRequestUrl, UnmatchedResponseBodyContentType, UnmatchedResponseStatusCode}
import com.useoptic.logging.Logger
import com.useoptic.types.capture.HttpInteraction

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExportAll
case class NewEndpoint(path: String, method: String, pathId: Option[PathComponentId], count: Int)
@JSExportAll
case class EndpointDiffs(method: String, pathId: PathComponentId, diffs: Vector[InteractionDiffResult], interactionPointers: Seq[String]) {
  def count = diffs.size
}

@JSExport
@JSExportAll
object DiffResultHelper {
  def diffCount(diffs: InteractionsGroupedByDiff): Int = diffs.keys.size
  def unmatchedUrls(diffs: InteractionsGroupedByDiff, rfcState: RfcState): Vector[NewEndpoint] = {
    diffs.collect {
      case (newUrl: UnmatchedRequestUrl, interactions) => NewEndpoint(interactions.head.request.path, interactions.head.request.method, None, interactions.size)
      case (newMethod: UnmatchedRequestMethod, interactions) => {
        val location = getLocationForDiff(newMethod, interactions, rfcState)
        NewEndpoint(interactions.head.request.path, interactions.head.request.method, Some(location.get._1), interactions.size)
      }
    }
  }.toVector.sortBy(i => (i.method + i.path))

  def endpointDiffs(diffs: InteractionsGroupedByDiff, rfcState: RfcState): Vector[EndpointDiffs] = {
    diffs.filterNot {
      case (a: UnmatchedRequestUrl, _) => true
      case (a: UnmatchedRequestMethod, _) => true
      case _ => false
    }.flatMap {
      case (diff, interactions) => getLocationForDiff(diff, interactions, rfcState).map(location => {
        EndpointDiffs(location._2, location._1,  diffs.keys.toVector, interactions.map(_.uuid))
      })
    }.groupBy(i => (i.pathId, i.method)).map {
      case ((path, method), diffs) => EndpointDiffs(method, path, diffs.flatMap(_.diffs).toVector, diffs.flatMap(_.interactionPointers).toVector.distinct)
    }
  }.toVector.sortBy(_.diffs.size).reverse


  def getLocationForDiff(diff: InteractionDiffResult, interactions: Seq[HttpInteraction], rfcState: RfcState): Option[(PathComponentId, String, InteractionDiffResult)] = (diff, interactions) match {
    case (_: UnmatchedRequestUrl, interactions) => None
    case (d: InteractionDiffResult, interactions) => {
      d.requestsTrail match {
        case SpecRoot() => None
        case SpecPath(pathId) => Some(pathId, interactions.head.request.method, d)
        case SpecRequestRoot(requestId) => {
          val request = rfcState.requestsState.requests(requestId).requestDescriptor
          Some(request.pathComponentId, request.httpMethod, d)
        }
        case SpecRequestBody(requestId) => {
          val request = rfcState.requestsState.requests(requestId).requestDescriptor
          Some(request.pathComponentId, request.httpMethod, d)
        }
        case SpecResponseRoot(responseId) => {
          val response = rfcState.requestsState.responses(responseId).responseDescriptor
          Some(response.pathId, response.httpMethod, d)
        }
        case SpecResponseBody(responseId) => {
          val response = rfcState.requestsState.responses(responseId).responseDescriptor
          Some(response.pathId, response.httpMethod, d)
        }
      }
    }
    case _ => None
  }

}
