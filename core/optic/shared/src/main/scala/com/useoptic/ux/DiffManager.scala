package com.useoptic.ux

import com.useoptic.contexts.requests.Commands.PathComponentId
import com.useoptic.contexts.rfc.RfcState
import com.useoptic.diff.{DiffResult, InteractiveDiffInterpretation}
import com.useoptic.diff.helpers.DiffHelpers
import com.useoptic.diff.interactions.interpreters.{DefaultInterpreters, DiffDescription, DiffDescriptionInterpreters}
import com.useoptic.diff.interactions.{BodyUtilities, InteractionDiffResult, Resolvers, UnmatchedRequestBodyContentType, UnmatchedRequestBodyShape, UnmatchedResponseBodyContentType, UnmatchedResponseBodyShape, UnmatchedResponseStatusCode}
import com.useoptic.diff.shapes.ShapeDiffResult
import com.useoptic.types.capture.HttpInteraction

import scala.scalajs.js.annotation.JSExportAll
import scala.util.Try
import com.useoptic.utilities.DistinctBy._

@JSExportAll
class DiffManager(initialInteractions: Seq[HttpInteraction], onUpdated: () => Unit) {

  private var _currentRfcState: RfcState = null
  private var _interactionsGroupedByDiffs: DiffsToInteractionsMap = Map.empty
  private var _interactions: Seq[HttpInteraction] = initialInteractions

  //put simulated rfc state here.
  def updatedRfcState(rfcState: RfcState): Unit = {
    if (_currentRfcState != rfcState) {
      _currentRfcState = rfcState
      recomputeDiff
    }
  }

  def updateInteractions(httpInteractions: Seq[HttpInteraction]): Unit = {
    if (_interactions != httpInteractions) {
      _interactions = httpInteractions
      recomputeDiff
    }
  }

  def recomputeDiff() = {
    if (_currentRfcState != null) {
      _interactionsGroupedByDiffs = DiffHelpers.groupByDiffs(_currentRfcState, _interactions).map {
        case (diff, interactions) => (diff, interactions)
      }
    } else {
      _interactionsGroupedByDiffs = Map.empty
    }
    onUpdated()
  }

  def inputStats = s"${_interactions.length} interactions, yielding ${_interactionsGroupedByDiffs.flatMap(_._2).size} diffs"

  def managerForPathAndMethod(pathComponentId: PathComponentId, httpMethod: String, ignoredDiffs: Seq[DiffResult]): PathAndMethodDiffManager = {
    val parentManagerUpdate = (rfcState: RfcState) => updatedRfcState(rfcState)
    val filterIgnored = _interactionsGroupedByDiffs.filter(d => !ignoredDiffs.contains(d._1))

    new PathAndMethodDiffManager(pathComponentId, httpMethod)(filterIgnored, _currentRfcState) {
      def updatedRfcState(rfcState: RfcState): Unit = parentManagerUpdate(rfcState)
    }
  }

}

@JSExportAll
abstract class PathAndMethodDiffManager(pathComponentId: PathComponentId, httpMethod: String)(implicit val interactionsGroupedByDiffs: DiffsToInteractionsMap, rfcState: RfcState) {

  def updatedRfcState(rfcState: RfcState): Unit

  def suggestionsForDiff(diff: InteractionDiffResult, interaction: HttpInteraction): Seq[InteractiveDiffInterpretation] = {
    val basicInterpreter = new DefaultInterpreters(rfcState)

    basicInterpreter.interpret(diff, interaction)
  }

  def suggestionsForDiff(diff: InteractionDiffResult): Seq[InteractiveDiffInterpretation] = suggestionsForDiff(diff, interactionsGroupedByDiffs(diff.asInstanceOf[InteractionDiffResult]).head)

  def noDiff = interactionsGroupedByDiffs.keySet.isEmpty

  def collectRelatedShapeDiffs(diff: InteractionDiffResult): Set[ShapeDiffResult] = {
    val groupingIdOption = diff.shapeDiffResultOption.flatMap(_.groupingId)
    groupingIdOption.map(groupingId => {
      interactionsGroupedByDiffs.keys.collect {
        case d if d.shapeDiffResultOption.flatMap(_.groupingId).contains(groupingId) => d.shapeDiffResultOption.get
      }.toSet
    })
    .getOrElse(Set(diff.shapeDiffResultOption.get))
  }

  def diffRegions: TopLevelRegions = {

    val descriptionInterpreters = new DiffDescriptionInterpreters(rfcState)

    val newRegions = Region("New Regions",
      interactionsGroupedByDiffs.collect {
        case (diff: UnmatchedRequestBodyContentType, interactions) => {
          val description = descriptionInterpreters.interpret(diff, interactions.head)
          NewRegionDiffBlock(diff, interactions, inRequest = true, inResponse = false, diff.interactionTrail.requestBodyContentTypeOption(), None, description)(() => suggestionsForDiff(diff))
        }
        case (diff: UnmatchedResponseBodyContentType, interactions) => {
          val description = descriptionInterpreters.interpret(diff, interactions.head)
          NewRegionDiffBlock(diff, interactions, inRequest = false, inResponse = true, diff.interactionTrail.responseBodyContentTypeOption(), Some(diff.interactionTrail.statusCode()), description)(() => suggestionsForDiff(diff))
        }
        case (diff: UnmatchedResponseStatusCode, interactions) => {
          val description = descriptionInterpreters.interpret(diff, interactions.head)
          NewRegionDiffBlock(diff, interactions, inRequest = false, inResponse = true, None, Some(diff.interactionTrail.statusCode()), description)(() => suggestionsForDiff(diff))
        }
      }.toVector.sortBy(_.statusCode))

    val requestShapeRegions = interactionsGroupedByDiffs.filter {
      case (_: UnmatchedRequestBodyShape, _) => true
      case _ => false
    }.toSeq
      .distinctByIfDefined(a => a._1.shapeDiffResultOption.flatMap(_.groupingId))
      .groupBy(_._1.interactionTrail.requestBodyContentTypeOption())
      .map { case (contentType, diffMap) => Region(s"${contentType.get}", (diffMap.map(i => {
        val (diff, interactions) = i
        val description = descriptionInterpreters.interpret(diff, interactions.head)

        val previewRender = (interaction: HttpInteraction, withRfcState: Option[RfcState]) => {
          val innerRfcState = withRfcState.getOrElse(rfcState)
          DiffPreviewer.previewDiff(BodyUtilities.parseBody(interaction.request.body), innerRfcState, diff.shapeDiffResultOption.get.shapeTrail.rootShapeId, collectRelatedShapeDiffs(diff))
        }

        val responseRender = (interaction: HttpInteraction, withRfcState: Option[RfcState]) => Try {
          val innerRfcState = withRfcState.getOrElse(rfcState)
          val responseShapeID = Resolvers.resolveRequestShapeByInteraction(interaction, pathComponentId, innerRfcState.requestsState).get
          DiffPreviewer.previewDiff(BodyUtilities.parseBody(interaction.response.body), innerRfcState, responseShapeID, Set.empty)
        }.toOption

        BodyShapeDiffBlock(
          diff,
          diff.shapeDiffResultOption.get,
          interactions,
          inRequest = true,
          inResponse = false,
          contentType.get,
          description)(
          () => suggestionsForDiff(diff),
          (interaction: HttpInteraction, withRfcState: Option[RfcState]) => previewRender(interaction, withRfcState),
          (interaction: HttpInteraction, withRfcState: Option[RfcState]) => Some(previewRender(interaction, withRfcState)),
          (interaction: HttpInteraction, withRfcState: Option[RfcState]) => responseRender(interaction, withRfcState)
        )})))}
      .toSeq

    val responseShapeRegions = interactionsGroupedByDiffs.filter {
      case (_: UnmatchedResponseBodyShape, _) => true
      case _ => false
    }.toSeq
      .distinctByIfDefined(a => a._1.shapeDiffResultOption.flatMap(_.groupingId))
      .groupBy(_._1.interactionTrail.responseBodyContentTypeOption())
      .map { case (contentType, diffMap) => Region(s"${contentType.get}", (diffMap.map(i => {
        val (diff, interactions) = i
        val description = descriptionInterpreters.interpret(diff, interactions.head)

        val previewRender = (interaction: HttpInteraction, withRfcState: Option[RfcState]) => {
          val innerRfcState = withRfcState.getOrElse(rfcState)
          DiffPreviewer.previewDiff(BodyUtilities.parseBody(interaction.response.body), innerRfcState, diff.shapeDiffResultOption.get.shapeTrail.rootShapeId, collectRelatedShapeDiffs(diff))
        }
        val requestRender = (interaction: HttpInteraction, withRfcState: Option[RfcState]) => Try {
          val innerRfcState = withRfcState.getOrElse(rfcState)
          val requestBodyShapeId = Resolvers.resolveRequestShapeByInteraction(interaction, pathComponentId, innerRfcState.requestsState).get
          DiffPreviewer.previewDiff(BodyUtilities.parseBody(interaction.request.body), innerRfcState, requestBodyShapeId, Set.empty)
        }.toOption

        BodyShapeDiffBlock(
          diff,
          diff.shapeDiffResultOption.get,
          interactions,
          inRequest = false,
          inResponse = true,
          contentType.get,
          description)(
          () => suggestionsForDiff(diff),
          (interaction: HttpInteraction, withRfcState: Option[RfcState]) => previewRender(interaction, withRfcState),
          (interaction: HttpInteraction, withRfcState: Option[RfcState]) => requestRender(interaction, withRfcState),
          (interaction: HttpInteraction, withRfcState: Option[RfcState]) => Some(previewRender(interaction, withRfcState))
        )})))}
      .toSeq

    TopLevelRegions(newRegions, requestShapeRegions, responseShapeRegions)
  }

  def inputStats = {
    s"${interactionsGroupedByDiffs.values.flatten.seq.size} interactions, yielding ${interactionsGroupedByDiffs.keys.size} diffs \n\n ${interactionsGroupedByDiffs.keys.toString()}"
  }
}

