package com.useoptic.ux

import com.useoptic.contexts.requests.Commands
import com.useoptic.contexts.requests.Commands.PathComponentId
import com.useoptic.contexts.requests.projections.AllEndpointsProjection
import com.useoptic.contexts.rfc.RfcState
import com.useoptic.diff.helpers.DiffHelpers
import com.useoptic.diff.{DiffResult, InteractiveDiffInterpretation}
import com.useoptic.diff.helpers.DiffHelpers.InteractionPointersGroupedByDiff
import com.useoptic.diff.helpers.UndocumentedUrlHelpers.UrlCounter
import com.useoptic.diff.initial.ShapeBuildingStrategy
import com.useoptic.diff.interactions.interpreters.{DefaultInterpreters, DiffDescription, DiffDescriptionInterpreters}
import com.useoptic.diff.interactions._
import com.useoptic.diff.shapes.resolvers.ShapesResolvers
import com.useoptic.dsa.OpticIds
import com.useoptic.types.capture.{Body, HttpInteraction}
import com.useoptic.dsa.OpticIds

import scala.scalajs.js.annotation.{JSExport, JSExportAll}
import scala.util.{Random, Try}

@JSExport
@JSExportAll
object DiffResultHelper {

  implicit val ids = OpticIds.generator
  private val stableRandomSeed = scala.util.Random.nextLong()

  def unmatchedUrls(diffs: InteractionPointersGroupedByDiff, rfcState: RfcState): Vector[NewEndpoint] = {
    //@TODO: implement this
    Vector.empty
  }

  def splitUnmatchedUrls(urls: Seq[NewEndpoint], endpointDiffs: Seq[EndpointDiffs]): SplitUndocumentedUrls = {
    val random = scala.util.Random
    random.setSeed(stableRandomSeed)

    val undocumented = endpointDiffs.collect {
      case endpoint if !endpoint.isDocumentedEndpoint => NewEndpoint("", endpoint.method, Some(endpoint.pathId), endpoint.count)
    }

    if (urls.size > 250) {
      import com.useoptic.utilities.DistinctBy._
      //known paths should of course get preference
      val knownPaths = urls.filter(_.pathId.isDefined).distinctByIfDefined(i => (Some(i.pathId, i.method)))
      val urlsToShow = random.shuffle(urls).take(250 - knownPaths.length)
      SplitUndocumentedUrls( (knownPaths ++ urlsToShow).toVector.sortBy(_.count).reverse, undocumented, urls.size, urls.map(_.path).distinct)
    } else {
      SplitUndocumentedUrls(urls.sortBy(_.count).reverse, undocumented, urls.size, urls.map(_.path).distinct)
    }

  }

  def diffsForPathAndMethod(allEndpointDiffs: Seq[EndpointDiffs], pathId: PathComponentId, method: String, ignoredDiffs: Seq[DiffResult]): Map[InteractionDiffResult, Seq[String]] = {
    allEndpointDiffs.find(i => i.method == method && i.pathId == pathId)
      .map(i => i.diffs)
      .getOrElse(Map.empty)
  }

  def endpointDiffs(diffs: InteractionPointersGroupedByDiff, rfcState: RfcState): Seq[EndpointDiffs] = {

    val allEndpoints = AllEndpointsProjection.fromRfcState(rfcState)

    val endpointsFromDiff = {
      diffs.filterNot {
        case (a: UnmatchedRequestUrl, _) => true
        case (a: UnmatchedRequestMethod, _) => true
        case _ => false
      }.flatMap {
        case (diff, interactionPointers) => getLocationForDiff(diff, rfcState).map(location => {
          EndpointDiffs(location.method, location.pathId,  Map(diff -> interactionPointers), true)
        })
      }.groupBy(i => (i.pathId, i.method)).map {
        case ((path, method), diffs) => {
          val diffsForThisOne = diffs.flatMap(_.diffs).toMap
          val isADocumentedEndpoint = allEndpoints.exists(i => i.pathId == path && i.method == method)
          EndpointDiffs(method, path, diffsForThisOne, isADocumentedEndpoint)
        }
      }
    }.toVector

    val additionalEndpointsWithoutDiffs = AllEndpointsProjection.fromRfcState(rfcState).collect {
      //collect other endpoints we know exist, that don't have a diff
      case endpoint if !endpointsFromDiff.exists(i => i.pathId == endpoint.pathId && i.method == endpoint.method) => {
        EndpointDiffs(endpoint.method, endpoint.pathId, Map.empty /* always empty */, true)
      }
    }

    (endpointsFromDiff ++ additionalEndpointsWithoutDiffs).sortBy(_.count).reverse
  }


  def groupEndpointDiffsByRegion(diffs: Map[InteractionDiffResult, Seq[String]], rfcState: RfcState, method: String, pathId: PathComponentId): EndpointDiffGrouping = {


    val allRequests = rfcState.requestsState.requests.collect {
      case (id, request) if !request.isRemoved && request.requestDescriptor.pathComponentId == pathId && request.requestDescriptor.httpMethod == method  => request
    }


    val allResponses = rfcState.requestsState.responses.collect {
      case (id, response) if !response.isRemoved && response.responseDescriptor.pathId == pathId && response.responseDescriptor.httpMethod == method => response
    }


    val regions = newRegionDiffs(diffs)
    val body = bodyDiffs(diffs)

    val requestBodyDiffs = body.collect { case i if i.inRequest => i }.groupBy(_.contentType).map(i => {
      EndpointBodyDiffRegion(i._1, None, i._2.toVector)
    })

    val otherRequests = allRequests.flatMap(i => {
      val contentTypeOption = i.requestDescriptor.bodyDescriptor match {
        case Commands.UnsetBodyDescriptor() => None
        case Commands.ShapedBodyDescriptor(httpContentType, shapeId, isRemoved) => Some(httpContentType)
      }
      if (requestBodyDiffs.exists(_.contentType == contentTypeOption)) {
        None
      } else {
        Some(EndpointBodyDiffRegion(contentTypeOption, None, Seq.empty))
      }
    })


    val collectResponses = body.collect { case i if i.inResponse => i }.groupBy(i => (i.contentType, i.statusCode) ).map(i => {
      val (ct, sc) = i._1
      EndpointBodyDiffRegion(ct, sc, i._2.toVector)
    }).groupBy(_.statusCode.get)

    val allKnownStatusCodes = allResponses.map(_.responseDescriptor.httpStatusCode).filterNot(sc => collectResponses.keySet.contains(sc))

    val combinedResponses = (collectResponses ++ allKnownStatusCodes.map(i => (i, Iterable.empty)))
    val responseBodyDiffs = combinedResponses.map(i => {

      val contentTypeResponses = i._2.toSeq

      val otherResponsesForStatusCode = allResponses.filter(_.responseDescriptor.httpStatusCode == i._1).flatMap(res => {
        val contentTypeOption = res.responseDescriptor.bodyDescriptor match {
          case Commands.UnsetBodyDescriptor() => None
          case Commands.ShapedBodyDescriptor(httpContentType, _, __) => Some(httpContentType)
        }
        if (contentTypeResponses.exists(_.contentType == contentTypeOption)) {
          None
        } else {
          Some(EndpointBodyDiffRegion(contentTypeOption, Some(i._1), Seq.empty))
        }
      })

      EndpointResponseRegion(i._1, (contentTypeResponses ++ otherResponsesForStatusCode).sortBy(_.contentType.getOrElse("")))
    })



    EndpointDiffGrouping(
      (requestBodyDiffs ++ otherRequests).toSeq.sortBy(_.contentType.getOrElse("")),
      responseBodyDiffs.toSeq.sortBy(_.statusCode),
      regions
    )
  }

  def interactionsWithDiffsCount(diffs: Map[InteractionDiffResult, Seq[String]]): Int = diffs.flatMap(_._2).toSet.size
  def diffCount(diffs: Map[InteractionDiffResult, Seq[String]]): Int = diffs.size
  def diffAndInteractionsCount(diffs: Map[InteractionDiffResult, Seq[String]]): String = s"Diffs: ${diffs.size}, Interactions: ${diffs.values.map(_.size).sum}"

  def newRegionDiffs(diffs: Map[InteractionDiffResult, Seq[String]]): Seq[NewRegionDiff] = {
    val newRegions = diffs.filterKeys {
      case _: UnmatchedRequestBodyContentType => true
      case _: UnmatchedResponseBodyContentType => true
      case _: UnmatchedResponseStatusCode => true
      case _ => false
    }

    newRegions.map{ case (_diff, _interactionPointers) => {
      val _inRequest = _diff match {
        case _:UnmatchedRequestBodyContentType => true
        case _:UnmatchedResponseBodyContentType => false
        case _:UnmatchedResponseStatusCode => false
      }
      new NewRegionDiff {
        override val diff = _diff
        override val interactionPointers: Seq[String] = _interactionPointers
        override val inRequest: Boolean = _inRequest
        override val inResponse: Boolean = !_inRequest
        override val contentType: Option[String] = _diff match {
          case d: UnmatchedRequestBodyContentType => d.interactionTrail.responseBodyContentTypeOption()
          case d: UnmatchedResponseBodyContentType => d.interactionTrail.responseBodyContentTypeOption()
          case d: UnmatchedResponseStatusCode => d.interactionTrail.responseBodyContentTypeOption()
          case _ => None
        }
        override val statusCode: Option[Int] = _diff match {
          case d: UnmatchedResponseStatusCode => Some(d.interactionTrail.statusCode())
          case d: UnmatchedResponseBodyContentType => Some(d.interactionTrail.statusCode())
          case _  => None
        }
      }
    }}.toVector.sortBy(_.statusCode)
  }

  def bodyDiffs(diffs: Map[InteractionDiffResult, Seq[String]]): Seq[BodyDiff] = {
    val bodyRegions = diffs.filterKeys {
      case _: UnmatchedRequestBodyShape => true
      case _: UnmatchedResponseBodyShape => true
      case _ => false
    }

    bodyRegions.map { case (_diff, _interactionPointers) => {
      val _inRequest = _diff match {case _: UnmatchedRequestBodyShape => true; case _ => false}
      val _inResponse = _diff match {case _: UnmatchedResponseBodyShape  => true; case _ => false}

      val _location = if (_inRequest) Seq("Request Body", _diff.interactionTrail.requestContentType()) else
        Seq(s"${_diff.interactionTrail.statusCode()} Response", "Body", _diff.interactionTrail.responseBodyContentTypeOption().getOrElse(""))

      new BodyDiff {
        override val diff = _diff
        override val location = _location
        override val interactionPointers = _interactionPointers
        override val inRequest: Boolean = _inRequest
        override val inResponse: Boolean = _inResponse
        override val contentType: Option[String] = if (_inRequest) _diff.interactionTrail.requestBodyContentTypeOption() else _diff.interactionTrail.responseBodyContentTypeOption()
        override val statusCode: Option[Int] = Try(_diff.interactionTrail.statusCode()).toOption
      }
    }}.toVector
  }


  case class DiffLocation(pathId: PathComponentId, method: String)
  def getLocationForDiff(diff: InteractionDiffResult, rfcState: RfcState): Option[DiffLocation] = (diff) match {
    case (_: UnmatchedRequestUrl) => None
    case (d: InteractionDiffResult) => {
      d.requestsTrail match {
        case SpecRoot() => None
        case SpecPath(pathId) => d.interactionTrail.httpMethod().flatMap(method => Some(DiffLocation(pathId, method)))
        case SpecRequestRoot(requestId) => {
          val request = rfcState.requestsState.requests(requestId).requestDescriptor
          Some(DiffLocation(request.pathComponentId, request.httpMethod))
        }
        case SpecRequestBody(requestId) => {
          val request = rfcState.requestsState.requests(requestId).requestDescriptor
          Some(DiffLocation(request.pathComponentId, request.httpMethod))
        }
        case SpecResponseRoot(responseId) => {
          val response = rfcState.requestsState.responses(responseId).responseDescriptor
          Some(DiffLocation(response.pathId, response.httpMethod))
        }
        case SpecResponseBody(responseId) => {
          val response = rfcState.requestsState.responses(responseId).responseDescriptor
          Some(DiffLocation(response.pathId, response.httpMethod))
        }
      }
    }
    case _ => None
  }

  def descriptionFromDiff(diff: InteractionDiffResult, rfcState: RfcState, anInteraction: HttpInteraction): Option[DiffDescription] = Try {
    val descriptionInterpreters = new DiffDescriptionInterpreters(rfcState)
    descriptionInterpreters.interpret(diff, anInteraction)
  }.toOption

  def previewDiff(bodyDiff: BodyDiff, anInteraction: HttpInteraction, currentRfcState: RfcState): Option[SideBySideRenderHelper] = {

    val simulatedDiffPreviewer = new DiffPreviewer(currentRfcState)

    val targetDiff = bodyDiff.diff.asInstanceOf[InteractionDiffResult]

    val denormalized = denormalizeDiff(targetDiff, currentRfcState, anInteraction)

    if (denormalized.isEmpty) {
      println("COULD NOT DE-NORMALIZE DIFF" + bodyDiff.diff)
      return None
    }

    val firstDiff = denormalized.minBy(_.interactionTrail.toString) // in theory this will make the first diff the first in the trail (all else being equal)

    //@todo review this interface
    def previewForBodyAndDiff(body: Body): Option[SideBySideRenderHelper] = {
      simulatedDiffPreviewer.previewDiff(
        BodyUtilities.parseBody(body),
        Some(firstDiff.shapeDiffResultOption.get.shapeTrail.rootShapeId),
        denormalized.flatMap(_.shapeDiffResultOption),
        Set.empty)
    }

    previewForBodyAndDiff(if (bodyDiff.inRequest) anInteraction.request.body else anInteraction.response.body)
  }

  def denormalizeDiff(targetDiff: InteractionDiffResult, rfcState: RfcState, anInteraction: HttpInteraction): Set[InteractionDiffResult] = {
    val diffs = DiffHelpers.groupByDiffs(ShapesResolvers.newResolver(rfcState), rfcState, Vector(anInteraction))
    diffs.keySet.filter(i => i.normalize() == targetDiff) // only return diffs that normalize to normalized diff
  }

  def previewBody(body: Body, currentRfcState: RfcState): Option[SideBySideRenderHelper] = {
    val simulatedDiffPreviewer = new DiffPreviewer(currentRfcState)
    simulatedDiffPreviewer.previewBody(body)
  }

  def suggestionsForDiff(bodyDiff: BodyDiff, anInteraction: HttpInteraction, currentRfcState: RfcState): Seq[InteractiveDiffInterpretation] = {
    val resolvers = ShapesResolvers.newResolver(currentRfcState)
    val basicInterpreter = new DefaultInterpreters(resolvers, currentRfcState)
    basicInterpreter.interpret(bodyDiff.diff, Vector(anInteraction))
  }


}


// Helper Classes
@JSExportAll
case class NewEndpoint(path: String, method: String, pathId: Option[PathComponentId], count: Int)
@JSExportAll
case class EndpointDiffs(method: String, pathId: PathComponentId, diffs: Map[InteractionDiffResult, Seq[String]], isDocumentedEndpoint: Boolean) {
  def count = diffs.keys.size
}


@JSExportAll
abstract class NewRegionDiff {

  def isSameAs(b: NewRegionDiff): Boolean = {
    this.diff == b.diff &&
    this.interactionPointers == b.interactionPointers
  }

  val diff: InteractionDiffResult
  val interactionPointers: Seq[String]
  val inRequest: Boolean
  val inResponse: Boolean
  val contentType: Option[String]
  val statusCode: Option[Int]

  def firstInteractionPointer: String = interactionPointers.head
  def interactionsCount: Int = interactionPointers.size

  def randomPointers: Seq[String] = Random.shuffle(interactionPointers).take(100)

  def previewBodyRender(currentInteraction: HttpInteraction): Option[SideBySideRenderHelper] = {
    val body = if (inRequest) {
      currentInteraction.request.body
    } else {
      currentInteraction.response.body
    }
    new DiffPreviewer(null, null).previewBody(body)
  }

  def previewShapeRender(rfcState: RfcState, interactions: Vector[HttpInteraction], inferPolymorphism: Boolean): PreviewShapeAndCommands = {
    val diffPreviewer = new DiffPreviewer(ShapesResolvers.newResolver(rfcState), rfcState)

    def getBody(i: HttpInteraction) = {
      if (inRequest) {
        i.request.body
      } else {
        i.response.body
      }
    }

    val firstInteraction = interactions.head

    if (inferPolymorphism) {
      val bodies = interactions.map(getBody).flatMap(BodyUtilities.parseBody)
      implicit val shapeBuildingStrategy = ShapeBuildingStrategy.inferPolymorphism
      val preview = diffPreviewer.shapeOnlyFromShapeBuilder(bodies)
      PreviewShapeAndCommands(preview.map(_._2), toSuggestion(Vector(interactions.head), rfcState, inferPolymorphism).headOption)
    } else {
      implicit val shapeBuildingStrategy = ShapeBuildingStrategy.learnASingleInteraction
      val preview = diffPreviewer.shapeOnlyFromShapeBuilder(Vector(BodyUtilities.parseBody(getBody(firstInteraction))).flatten)
      PreviewShapeAndCommands(preview.map(_._2), toSuggestion(interactions, rfcState, inferPolymorphism).headOption)
    }
  }


  def toSuggestion(interactions: Vector[HttpInteraction], currentRfcState: RfcState, inferPolymorphism: Boolean): Seq[InteractiveDiffInterpretation] = {
    implicit val ids = OpticIds.generator
    val resolvers = ShapesResolvers.newResolver(currentRfcState)
    val basicInterpreter = new DefaultInterpreters(resolvers, currentRfcState)
    if (inferPolymorphism) {
      basicInterpreter.interpret(diff, interactions)
    } else {
      basicInterpreter.interpret(diff, interactions.head)
    }
  }

  override def toString(): String = diff.toString + interactionPointers.toString()

}

@JSExportAll
abstract class BodyDiff {

  def isSameAs(b: BodyDiff): Boolean = this.diff == b.diff

  val diff: InteractionDiffResult
  val location: Seq[String]
  val interactionPointers: Seq[String]
  val contentType: Option[String]
  val statusCode: Option[Int]
  val inRequest: Boolean
  val inResponse: Boolean

  override def toString: PathComponentId = diff.toString + interactionPointers.toString()

  def firstInteractionPointer: String = interactionPointers.head
  def interactionsCount: Int = interactionPointers.size
}

@JSExportAll
case class EndpointDiffGrouping(requestDiffs: Seq[EndpointBodyDiffRegion],
                                responseDiffs: Seq[EndpointResponseRegion],
                                newRegions: Seq[NewRegionDiff]) {
  def hasNewRegions: Boolean = newRegions.nonEmpty
  def empty: Boolean = requestDiffs.flatMap(_.bodyDiffs).isEmpty && responseDiffs.flatMap(_.regions.flatMap(_.bodyDiffs)).isEmpty && newRegions.isEmpty

  def newRegionsCount = newRegions.size
  def requestCount = requestDiffs.flatMap(_.bodyDiffs).size
  def responseCount = responseDiffs.flatMap(_.regions.flatMap(_.bodyDiffs)).size

  def firstRequestIdWithDiff: Option[String] = requestDiffs.find(_.bodyDiffs.nonEmpty).map(_.id)
  def firstResponseIdWithDiff: Option[String] = {
    val all = responseDiffs.flatMap(_.regions)
    all.find(_.bodyDiffs.nonEmpty).map(_.id)
  }


  def bodyDiffsForId(id: String): Seq[BodyDiff] = {
    Seq(requestDiffs.find(_.id == id), responseDiffs.flatMap(_.regions).find(_.id == id)).flatten.headOption.map(_.bodyDiffs)
      .getOrElse(Seq.empty)
  }

}
@JSExportAll
case class EndpointBodyDiffRegion(contentType: Option[String], statusCode: Option[Int], bodyDiffs: Seq[BodyDiff]) {
  def id = s"${statusCode.toString} ${contentType.getOrElse("no_body")}"
  def count = bodyDiffs.size
}
@JSExportAll
case class EndpointResponseRegion(statusCode: Int, regions: Seq[EndpointBodyDiffRegion])

@JSExportAll
case class PreviewShapeAndCommands(shape: Option[ShapeOnlyRenderHelper], suggestion: Option[InteractiveDiffInterpretation])


@JSExportAll
case class SplitUndocumentedUrls(urls: Seq[NewEndpoint], undocumented: Seq[NewEndpoint], totalCount: Int, allPaths: Seq[String]) {
   def showing: Int = urls.length
}
