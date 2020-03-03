package com.useoptic.diff.helpers

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.diff.helpers.DiffHelpers.{DiffsGroupedByRegion, InteractionsGroupedByDiff}
import com.useoptic.diff.interactions.{InteractionDiffResult, Traverser, UnmatchedRequestBodyContentType, UnmatchedRequestBodyShape, UnmatchedRequestMethod, UnmatchedRequestUrl, UnmatchedResponseBodyContentType, UnmatchedResponseBodyShape, UnmatchedResponseStatusCode}
import com.useoptic.diff.interactions.visitors.DiffVisitors
import com.useoptic.types.capture.HttpInteraction

import scala.collection.immutable
import scala.scalajs.js.annotation.{JSExport, JSExportAll}


@JSExport
@JSExportAll
object DiffHelpers {
  def diff(rfcState: RfcState, interaction: HttpInteraction): Seq[InteractionDiffResult] = {
    val visitors = new DiffVisitors()
    val traverser = new Traverser(rfcState, visitors)
    traverser.traverse(interaction)
    visitors.diffs.toSeq
  }

  def diffAll(rfcState: RfcState, interactions: Seq[HttpInteraction]): Set[InteractionDiffResult] = {
    val diffSet: Set[InteractionDiffResult] = Set.empty
    interactions.foldLeft(diffSet)((diffs, interaction) => {
      diffs ++ diff(rfcState, interaction)
    })
  }

  type InteractionsGroupedByDiff = Map[InteractionDiffResult, Seq[HttpInteraction]]

  def groupByDiffs(rfcState: RfcState, interactions: Seq[HttpInteraction], initial: InteractionsGroupedByDiff = Map.empty): InteractionsGroupedByDiff = {
    interactions.foldLeft(initial)((acc, interaction) => {
      val diffs = diff(rfcState, interaction)
      val changedItems =
        diffs.map((diff) => {
          (diff -> (acc.getOrElse(diff, Seq.empty) :+ interaction))
        }).toMap
      acc ++ changedItems
    })
  }

  type DiffsGroupedByRegion = Map[DiffLocation, Iterable[InteractionDiffResult]]
}


@JSExport
@JSExportAll
case class DiffRegionsHelpers(diffsGroupedByRegion: DiffsGroupedByRegion) {
  def keys(): Seq[DiffLocation] = diffsGroupedByRegion.keys.toSeq

  def isEmpty: Boolean = diffsGroupedByRegion.isEmpty

  def inRequest: Iterable[InteractionDiffResult] = diffsGroupedByRegion.collect{
    case (DiffInRequest, b) => b
    case (DiffInRequestWithContentType(_), b) => b
  }.flatten

  def inRequestWithContentType(contentType: String): Iterable[InteractionDiffResult] = diffsGroupedByRegion.collect{
    case (DiffInRequestWithContentType(_contentType), b) if _contentType == contentType => b
  }.flatten

  def inResponseWithStatusCode(statusCode: Int): Iterable[InteractionDiffResult] = diffsGroupedByRegion.collect{
    case (DiffInResponseWithStatusCode(_statusCode), b) if _statusCode == statusCode  => b
    case (DiffInResponseWithStatusCodeAndContentType(_statusCode, _), b) if _statusCode == statusCode  => b
  }.flatten

  def inResponseWithStatusCodeAndContentType(statusCode: Int, contentType: String): Iterable[InteractionDiffResult] = diffsGroupedByRegion.collect{
    case (DiffInResponseWithStatusCodeAndContentType(_statusCode, _contentType), b) if _statusCode == statusCode && _contentType == contentType => b
  }.flatten

  def statusCodes: Seq[Int] = diffsGroupedByRegion.collect{
    case (DiffInResponseWithStatusCode(statusCode), b) => statusCode
    case (DiffInResponseWithStatusCodeAndContentType(statusCode, _), b) => statusCode
  }.toSeq.distinct.sorted

  def responseContentTypes: Seq[String] = diffsGroupedByRegion.collect{
    case (DiffInResponseWithStatusCodeAndContentType(_, contentType), b) => contentType
  }.toSeq.distinct.sorted

  def responseContentTypesForStatusCode(statusCode: Int): Seq[String] = diffsGroupedByRegion.collect{
    case (DiffInResponseWithStatusCodeAndContentType(_statusCode, contentType), b) if _statusCode == statusCode => contentType
  }.toSeq.distinct.sorted

  def requestContentTypes: Seq[String] = diffsGroupedByRegion.collect{
    case (DiffInRequestWithContentType(contentType), b) => contentType
  }.toSeq.distinct.sorted

}

trait DiffLocation
case object UnmatchedUrl extends DiffLocation
case object UnmatchedMethod extends DiffLocation
case object DiffInRequest extends DiffLocation
case class DiffInRequestWithContentType(contentType: String) extends DiffLocation
case class DiffInResponseWithStatusCode(statusCode: Int) extends DiffLocation
case class DiffInResponseWithStatusCodeAndContentType(statusCode: Int, contentType: String) extends DiffLocation


@JSExport
@JSExportAll
case class DiffResultHelpers(interactionsGroupedByDiff: InteractionsGroupedByDiff) {
  def listRegions(): DiffRegionsHelpers = {
    val groupedKeys = interactionsGroupedByDiff.keys.groupBy {
      case d: UnmatchedRequestUrl => UnmatchedUrl
      case d: UnmatchedRequestMethod => UnmatchedMethod
      case d: UnmatchedRequestBodyContentType => DiffInRequest
      case d: UnmatchedRequestBodyShape => DiffInRequestWithContentType(d.interactionTrail.requestContentType())
      case d: UnmatchedResponseStatusCode =>  DiffInResponseWithStatusCode(d.interactionTrail.statusCode())
      case d: UnmatchedResponseBodyContentType => DiffInResponseWithStatusCode(d.interactionTrail.statusCode())
      case d: UnmatchedResponseBodyShape => DiffInResponseWithStatusCodeAndContentType(d.interactionTrail.statusCode(), d.interactionTrail.responseContentType())
    }

    DiffRegionsHelpers(groupedKeys.asInstanceOf[Map[DiffLocation, Iterable[InteractionDiffResult]]])
  }

  def isEmpty: Boolean = interactionsGroupedByDiff.keys.isEmpty

  def keys(): Seq[InteractionDiffResult] = interactionsGroupedByDiff.keySet.toSeq

  def get(diff: InteractionDiffResult): Seq[HttpInteraction] = interactionsGroupedByDiff.getOrElse(diff, Seq.empty)

  def filterOut(ignored: Seq[InteractionDiffResult] = Seq.empty): DiffResultHelpers = {
    DiffResultHelpers(interactionsGroupedByDiff.filterKeys(i => !ignored.contains(i)))
  }
}
