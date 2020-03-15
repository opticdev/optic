package com.useoptic.ux

import com.useoptic.contexts.requests.Commands.PathComponentId
import com.useoptic.contexts.rfc.RfcState
import com.useoptic.diff.helpers.DiffHelpers
import com.useoptic.diff.interactions.interpreters.{DiffDescription, DiffDescriptionInterpreters}
import com.useoptic.diff.interactions.{InteractionDiffResult, UnmatchedRequestBodyContentType, UnmatchedRequestBodyShape, UnmatchedResponseBodyContentType, UnmatchedResponseStatusCode}
import com.useoptic.types.capture.HttpInteraction

import scala.scalajs.js.annotation.JSExportAll

@JSExportAll
class DiffManager(initialInteractions: Seq[HttpInteraction]) {

  private var _initialRfcState: RfcState = null
  private var _currentRfcState: RfcState = null
  private var _interactionsGroupedByDiffs: DiffsToInteractionsMap = null
  private var _interactions: Seq[HttpInteraction] = initialInteractions

  //put simulated rfc state here.
  def updatedRfcState(rfcState: RfcState): Unit = {
    if (_initialRfcState == null) {
      _initialRfcState = rfcState
    }
    _currentRfcState = rfcState
    //compute diff

    _interactionsGroupedByDiffs = DiffHelpers.groupByDiffs(_currentRfcState, _interactions).map {
      case (diff, interactions) => (diff, interactions)
    }
  }

  def updateInteractions(httpInteractions: Seq[HttpInteraction]) = {
    _interactions = httpInteractions
    if (_currentRfcState != null) {
      _interactionsGroupedByDiffs = DiffHelpers.groupByDiffs(_currentRfcState, _interactions).map {
        case (diff, interactions) => (diff, interactions)
      }
    } else {
      _interactionsGroupedByDiffs = Map.empty
    }
  }

  def managerForPathAndMethod(pathComponentId: PathComponentId, httpMethod: String): PathAndMethodDiffManager = {
    val parentManagerUpdate = (rfcState: RfcState) => updatedRfcState(rfcState)

    new PathAndMethodDiffManager(pathComponentId, httpMethod)(_interactionsGroupedByDiffs) {
      def updatedRfcState(rfcState: RfcState): Unit = parentManagerUpdate(rfcState)
    }
  }

}

@JSExportAll
abstract class PathAndMethodDiffManager(pathComponentId: PathComponentId, httpMethod: String)(implicit val interactionsGroupedByDiffs: DiffsToInteractionsMap) {
  def updatedRfcState(rfcState: RfcState): Unit

  def diffRegions: TopLevelRegions = {
    val newRegions = Region("New Regions",
      interactionsGroupedByDiffs.collect {
        case (diff: UnmatchedRequestBodyContentType, interactions) => NewRegionDiffBlock(diff, interactions, inRequest = true, inResponse = false, diff.interactionTrail.requestBodyContentTypeOption(), None)
        case (diff: UnmatchedResponseBodyContentType, interactions) => NewRegionDiffBlock(diff, interactions, inRequest = false, inResponse = true, diff.interactionTrail.responseBodyContentTypeOption(), Some(diff.interactionTrail.statusCode()))
        case (diff: UnmatchedResponseStatusCode, interactions) => NewRegionDiffBlock(diff, interactions, inRequest = false, inResponse = true, None, Some(diff.interactionTrail.statusCode()))
      }.toVector.sortBy(_.statusCode))

    val requestShapeRegions = interactionsGroupedByDiffs.filter {
      case (_: UnmatchedRequestBodyShape, _) => true
    }.toSeq
      .groupBy(_._1.interactionTrail.requestBodyContentTypeOption())
      .filterNot(_._1.isEmpty) // there shouldn't be a shape diff for an empty body
      .map { case (contentType, diffMap) => Region(s"${contentType.get}", (diffMap.map(i => {
        val (diff, interactions) = i
        BodyShapeDiffBlock(diff, diff.shapeDiffResultOption.get, interactions, inRequest = true, inResponse = false, contentType.get)
      }))) }
      .toSeq

    val responseShapeRegions = interactionsGroupedByDiffs.filter {
      case (_: UnmatchedResponseBodyContentType, _) => true
    }.toSeq
      .groupBy(_._1.interactionTrail.requestBodyContentTypeOption())
      .filterNot(_._1.isEmpty) // there shouldn't be a shape diff for an empty body
      .map { case (contentType, diffMap) => Region(s"${contentType.get}", (diffMap.map(i => {
        val (diff, interactions) = i
        BodyShapeDiffBlock(diff, diff.shapeDiffResultOption.get, interactions, inRequest = false, inResponse = true, contentType.get)
      }))) }
      .toSeq

    TopLevelRegions(newRegions, requestShapeRegions, responseShapeRegions)
  }
}

