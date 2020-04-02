package com.useoptic.ux

import com.useoptic.DiffStats
import com.useoptic.contexts.requests.Commands.PathComponentId
import com.useoptic.contexts.requests.Utilities
import com.useoptic.contexts.rfc.RfcState
import com.useoptic.diff.{ChangeType, DiffResult, InteractiveDiffInterpretation}
import com.useoptic.diff.helpers.DiffHelpers
import com.useoptic.diff.interactions.interpreters.{DefaultInterpreters, DiffDescription, DiffDescriptionInterpreters}
import com.useoptic.diff.interactions.{BodyUtilities, InteractionDiffResult, InteractionTrail, RequestSpecTrail, RequestSpecTrailHelpers, Resolvers, ShapeRelatedDiff, SpecPath, SpecRequestBody, SpecRequestRoot, SpecResponseBody, SpecResponseRoot, SpecRoot, UnmatchedRequestBodyContentType, UnmatchedRequestBodyShape, UnmatchedRequestMethod, UnmatchedRequestUrl, UnmatchedResponseBodyContentType, UnmatchedResponseBodyShape, UnmatchedResponseStatusCode}
import com.useoptic.diff.shapes.ShapeDiffResult
import com.useoptic.types.capture.HttpInteraction

import scala.scalajs.js.annotation.JSExportAll
import scala.util.Try
import com.useoptic.utilities.DistinctBy._

@JSExportAll
class DiffManager(initialInteractions: Seq[HttpInteraction], onUpdated: () => Unit = () => {}) {

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

  def filterIgnored(ignoredDiffs: Seq[DiffResult]) = _interactionsGroupedByDiffs.filter(d => !ignoredDiffs.contains(d._1))

  def unmatchedUrls(alphabetize: Boolean = false, ignoredDiffs: Seq[DiffResult] = Seq.empty): Seq[UndocumentedURL] = {
    if (_currentRfcState == null) {
      return Seq.empty
    }
    println("HERE LOOK")

    def checkForEmptyContentType(interactionTrail: InteractionTrail, specTrail: RequestSpecTrail, interactions: Seq[HttpInteraction]) = {
      println(specTrail)
      val pathOption = RequestSpecTrailHelpers.pathId(specTrail)
      if (pathOption.isDefined) {
        interactions.flatMap(interaction => {
          val noOps = Resolvers.resolveOperations(interaction.request.method, pathOption.get, _currentRfcState.requestsState).isEmpty
          val noResponses = Resolvers.resolveResponses(interaction.request.method, pathOption.get, _currentRfcState.requestsState).isEmpty

          if (noOps && noResponses) {
            Some((interaction.request.method, interaction.request.path, pathOption) -> interaction)
          } else {
            None
          }
        })
      } else {
        Seq.empty
      }
    }

    val fromDiff = filterIgnored(ignoredDiffs).collect {
      case (UnmatchedRequestUrl(interactionTrail, requestsTrail), interactions) => {
        interactions.map(i => (i.request.method, i.request.path, None) -> i)
      }
      case (UnmatchedRequestBodyContentType(interactionTrail, specTrail), interactions) => {
        checkForEmptyContentType(interactionTrail, specTrail, interactions)
      }
      case (UnmatchedResponseBodyContentType(interactionTrail, specTrail), interactions) => {
        checkForEmptyContentType(interactionTrail, specTrail, interactions)
      }
      case (UnmatchedResponseBodyContentType(interactionTrail, specTrail), interactions) => {
        checkForEmptyContentType(interactionTrail, specTrail, interactions)
      }
      case (UnmatchedResponseStatusCode(interactionTrail, specTrail), interactions) => {
        checkForEmptyContentType(interactionTrail, specTrail, interactions)
      }
    }.flatten
      .groupBy(_._1)
      .mapValues(i => i.map(_._2))
      .filter(_._2.exists(i => i.response.statusCode >= 200 && i.response.statusCode < 300))
    
    val allUnmatchedUrls = fromDiff.map { case ((method, path, pathOption), interactions) => UndocumentedURL(method, path, pathOption, interactions.toSeq) }.toSeq

    if (alphabetize) {
      allUnmatchedUrls.sortBy(_.path)
    } else {
      allUnmatchedUrls.sortBy(_.interactions.size).reverse
    }
  }

  def allUnmatchedPaths: Seq[String] = unmatchedUrls(true, Seq.empty).map(_.path).distinct

  def endpointDiffs(ignoredDiffs: Seq[DiffResult], filterUnmatched: Boolean = false): Seq[EndpointDiff] = {
    val diffs = filterIgnored(ignoredDiffs)

    val allEndpointDiffs = diffs.collect {
      case (_: UnmatchedRequestUrl, interactions) => None
      case (d: InteractionDiffResult, interactions) => {
        d.requestsTrail match {
          case SpecRoot() => None
          case SpecPath(pathId) => Some(pathId, interactions.head.request.method, d)
          case SpecRequestRoot(requestId) => {
            val request = _currentRfcState.requestsState.requests(requestId).requestDescriptor
            Some(request.pathComponentId, request.httpMethod, d)
          }
          case SpecRequestBody(requestId) => {
            val request = _currentRfcState.requestsState.requests(requestId).requestDescriptor
            Some(request.pathComponentId, request.httpMethod, d)
          }
          case SpecResponseRoot(responseId) => {
            val response = _currentRfcState.requestsState.responses(responseId).responseDescriptor
            Some(response.pathId, response.httpMethod, d)
          }
          case SpecResponseBody(responseId) => {
            val response = _currentRfcState.requestsState.responses(responseId).responseDescriptor
            Some(response.pathId, response.httpMethod, d)
          }
        }
      }
      case _ => None
    }.flatten

    val descriptionInterpreters = new DiffDescriptionInterpreters(_currentRfcState)

    val endpointDiffs = allEndpointDiffs.groupBy(i => (i._1, i._2)).map {
      case ((path, method), v) => {
        val diffs = v.map(_._3).toSet
        val changeTypes = diffs.map(diff => descriptionInterpreters.interpret(diff, _interactionsGroupedByDiffs(diff).head).changeType)
        EndpointDiff(method, path,
          changeTypes.count(_ == ChangeType.Addition),
          changeTypes.count(_ == ChangeType.Update),
          changeTypes.count(_ == ChangeType.Removal)
        )
      }
    }.toSeq

    val unmatched = unmatchedUrls(true, ignoredDiffs)

    //don't show an endpoint diff if its in the unmatched list
    if (filterUnmatched) endpointDiffs.filterNot(i => unmatched.exists(u => u.pathId.contains(i.pathId) && u.method == i.method)) else endpointDiffs
  }

  def stats(ignoredDiffs: Seq[DiffResult]): DiffStats = {
    DiffStats(
      _interactions.size,
      _interactionsGroupedByDiffs.keys.filterNot {
        case UnmatchedRequestUrl(_, _) => true
        case _ => false
      }.size,
      unmatchedUrls(true, ignoredDiffs).size
    )
  }

  def managerForPathAndMethod(pathComponentId: PathComponentId, httpMethod: String, ignoredDiffs: Seq[DiffResult]): PathAndMethodDiffManager = {
    val parentManagerUpdate = (rfcState: RfcState) => updatedRfcState(rfcState)

    println("filter progress " + "Start")
    println("filter progress " + endpointDiffs(ignoredDiffs).toString())
    println("filter progress " + _interactionsGroupedByDiffs.keys.size)
    val filterIgnored = _interactionsGroupedByDiffs.filter(d => !ignoredDiffs.contains(d._1))
    println("filter progress " + filterIgnored.size)

    val filterThisEndpoint = {
      //collect all request and response ids we have diffs computed for
      val requestIds = _currentRfcState.requestsState.requests.collect {
        case req if req._2.requestDescriptor.httpMethod == httpMethod && req._2.requestDescriptor.pathComponentId == pathComponentId => req._1
      }.toSet

      val responseIds = _currentRfcState.requestsState.responses.collect {
        case res if res._2.responseDescriptor.httpMethod == httpMethod && res._2.responseDescriptor.pathId == pathComponentId => res._1
      }.toSet

      val diffsFiltered = filterIgnored.filterKeys {
        case _: UnmatchedRequestUrl => false
        case d: InteractionDiffResult => {
          d.requestsTrail match {
            case SpecRoot() => false
            case SpecPath(pathId) => pathComponentId == pathId
            case SpecRequestRoot(requestId) => requestIds.contains(requestId)
            case SpecRequestBody(requestId) => requestIds.contains(requestId)
            case SpecResponseRoot(responseId) => responseIds.contains(responseId)
            case SpecResponseBody(responseId) => responseIds.contains(responseId)
          }
        }
        case _ => false
      }

      println("filter progress " + diffsFiltered.size)
      //@hack spec trails don't contain method :(
      //this makes sure that other methods don't sneak their way
      diffsFiltered.mapValues(_.filter(_.request.method == httpMethod)).filter(_._2.nonEmpty)
    }

    println("filter progress " + filterThisEndpoint.keys.size)

    new PathAndMethodDiffManager(pathComponentId, httpMethod)(filterThisEndpoint, _currentRfcState) {
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

  def diffCount: Int = interactionsGroupedByDiffs.keys.size

  def interactionsWithDiffsCount: Int = interactionsGroupedByDiffs.values.flatten.size

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
      case (a: UnmatchedRequestBodyShape, _) => true
      case _ => false
    }.toSeq
      .distinctByIfDefined(a => a._1.shapeDiffResultOption.flatMap(_.groupingId))
      .groupBy(_._1.interactionTrail.requestBodyContentTypeOption())
      .map { case (contentType, diffMap) => Region(s"${contentType.get}", (diffMap.map(i => {
        val (diff, interactions) = i
        val description = descriptionInterpreters.interpret(diff, interactions.head)

        val relatedDiffs = collectRelatedShapeDiffs(diff)

        val previewRender = (interaction: HttpInteraction, withRfcState: Option[RfcState]) => {
          val innerRfcState = withRfcState.getOrElse(rfcState)
          DiffPreviewer.previewDiff(BodyUtilities.parseBody(interaction.request.body), innerRfcState, diff.shapeDiffResultOption.get.shapeTrail.rootShapeId, relatedDiffs)
        }

        val responseRender = (interaction: HttpInteraction, withRfcState: Option[RfcState]) => Try {
          val innerRfcState = withRfcState.getOrElse(rfcState)
          val responseShapeID = Resolvers.resolveRequestShapeByInteraction(interaction, pathComponentId, innerRfcState.requestsState).get
          DiffPreviewer.previewDiff(BodyUtilities.parseBody(interaction.response.body), innerRfcState, responseShapeID, Set.empty)
        }.toOption

        BodyShapeDiffBlock(
          diff,
          Seq("Request Body", contentType.get),
          diff.shapeDiffResultOption.get,
          interactions,
          inRequest = true,
          inResponse = false,
          description,
          relatedDiffs)(
          () => suggestionsForDiff(diff),
          (interaction: HttpInteraction, withRfcState: Option[RfcState]) => previewRender(interaction, withRfcState),
          (interaction: HttpInteraction, withRfcState: Option[RfcState]) => Some(previewRender(interaction, withRfcState)),
          (interaction: HttpInteraction, withRfcState: Option[RfcState]) => responseRender(interaction, withRfcState)
        )
      })))
      }
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

        val relatedDiffs = collectRelatedShapeDiffs(diff)

        val previewRender = (interaction: HttpInteraction, withRfcState: Option[RfcState]) => {
          val innerRfcState = withRfcState.getOrElse(rfcState)
          DiffPreviewer.previewDiff(BodyUtilities.parseBody(interaction.response.body), innerRfcState, diff.shapeDiffResultOption.get.shapeTrail.rootShapeId, relatedDiffs)
        }
        val requestRender = (interaction: HttpInteraction, withRfcState: Option[RfcState]) => Try {
          val innerRfcState = withRfcState.getOrElse(rfcState)
          val requestBodyShapeId = Resolvers.resolveRequestShapeByInteraction(interaction, pathComponentId, innerRfcState.requestsState).get
          DiffPreviewer.previewDiff(BodyUtilities.parseBody(interaction.request.body), innerRfcState, requestBodyShapeId, Set.empty)
        }.toOption

        BodyShapeDiffBlock(
          diff,
          Seq(s"${interactions.head.response.statusCode} Response", "Body", contentType.get),
          diff.shapeDiffResultOption.get,
          interactions,
          inRequest = false,
          inResponse = true,
          description,
          relatedDiffs)(
          () => suggestionsForDiff(diff),
          (interaction: HttpInteraction, withRfcState: Option[RfcState]) => previewRender(interaction, withRfcState),
          (interaction: HttpInteraction, withRfcState: Option[RfcState]) => requestRender(interaction, withRfcState),
          (interaction: HttpInteraction, withRfcState: Option[RfcState]) => Some(previewRender(interaction, withRfcState))
        )
      })))
      }
      .toSeq
        .sortBy(_.name)

    TopLevelRegions(newRegions, requestShapeRegions, responseShapeRegions)
  }

  def inputStats = {
    s"${interactionsGroupedByDiffs.values.flatten.seq.size} interactions, yielding ${interactionsGroupedByDiffs.keys.size} diffs \n\n ${interactionsGroupedByDiffs.keys.toString()}"
  }
}

