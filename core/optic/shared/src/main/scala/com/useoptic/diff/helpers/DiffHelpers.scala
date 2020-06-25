package com.useoptic.diff.helpers

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.diff.helpers.DiffHelpers.{DiffsGroupedByRegion, InteractionsGroupedByDiff, diff}
import com.useoptic.diff.interactions.{InteractionDiffResult, Traverser, UnmatchedRequestBodyContentType, UnmatchedRequestBodyShape, UnmatchedRequestMethod, UnmatchedRequestUrl, UnmatchedResponseBodyContentType, UnmatchedResponseBodyShape, UnmatchedResponseStatusCode}
import com.useoptic.diff.interactions.visitors.DiffVisitors
import com.useoptic.diff.shapes.resolvers.ShapesResolvers
import com.useoptic.types.capture.HttpInteraction

import scala.scalajs.js.annotation.{JSExport, JSExportAll}


@JSExport
@JSExportAll
object DiffHelpers {
  def diff(resolvers: ShapesResolvers, rfcState: RfcState, interaction: HttpInteraction): Seq[InteractionDiffResult] = {
    val diffs = new scala.collection.mutable.ArrayBuffer[InteractionDiffResult]()

    def emit(diff: InteractionDiffResult) = {
      diffs.append(diff)
    }

    val diffVisitors = new DiffVisitors(resolvers, emit)
    val traverser = new Traverser(rfcState, diffVisitors)
    traverser.traverse(interaction)
    diffs
  }

  def diffAll(resolvers: ShapesResolvers, rfcState: RfcState, interactions: Seq[HttpInteraction]): Set[InteractionDiffResult] = {
    val diffSet: Set[InteractionDiffResult] = Set.empty
    interactions.foldLeft(diffSet)((diffs, interaction) => {
      diffs ++ diff(resolvers, rfcState, interaction)
    })
  }

  type InteractionsGroupedByDiff = Map[InteractionDiffResult, Seq[HttpInteraction]]
  type InteractionPointersGroupedByDiff = Map[InteractionDiffResult, Seq[String]]

  def groupByDiffs(resolvers: ShapesResolvers, rfcState: RfcState, interactions: Seq[HttpInteraction], initial: InteractionsGroupedByDiff = Map.empty): InteractionsGroupedByDiff = {
    interactions.foldLeft(initial)((acc, interaction) => {
      val diffs = diff(resolvers, rfcState, interaction)
      val changedItems =
        diffs.map((diff) => {
          (diff -> (acc.getOrElse(diff, Seq.empty) :+ interaction))
        }).toMap
      acc ++ changedItems
    })
  }

  def groupByNormalizedDiffs(resolvers: ShapesResolvers, rfcState: RfcState, interactions: Seq[HttpInteraction], initial: InteractionsGroupedByDiff = Map.empty): InteractionsGroupedByDiff = {
    interactions.foldLeft(initial)((acc, interaction) => {
      val diffs = diff(resolvers, rfcState, interaction)
      val changedItems =
        diffs.map((diff) => {
          val normalized = diff.normalize()
          (normalized -> (acc.getOrElse(normalized, Seq.empty) :+ interaction))
        }).toMap
      acc ++ changedItems
    })
  }

  type InteractionToPointer = (HttpInteraction) => String

  def groupInteractionPointersByNormalizedDiffs(resolvers: ShapesResolvers, rfcState: RfcState, interactions: Seq[HttpInteraction], toPointer: InteractionToPointer, initial: InteractionPointersGroupedByDiff = Map.empty): InteractionPointersGroupedByDiff = {
    interactions.foldLeft(initial)((acc, interaction) => {
      val diffs = diff(resolvers, rfcState, interaction)
      val changedItems =
        diffs.map((diff) => {
          val normalized = diff.normalize()
          (normalized -> (acc.getOrElse(normalized, Seq.empty) :+ toPointer(interaction)))
        }).toMap
      acc ++ changedItems
    })
  }

  def groupInteractionPointerByNormalizedDiffs(resolvers: ShapesResolvers, rfcState: RfcState, interaction: HttpInteraction, pointer: String, initial: InteractionPointersGroupedByDiff = Map.empty): InteractionPointersGroupedByDiff = {
    groupInteractionPointersByNormalizedDiffs(resolvers, rfcState, Seq(interaction), (_) => pointer, initial)
  }

  def emptyInteractionsGroupedByDiff(): InteractionsGroupedByDiff = Map.empty

  def emptyInteractionPointersGroupedByDiff(): InteractionPointersGroupedByDiff = Map.empty

  def hasDiff(diff: InteractionsGroupedByDiff) = diff.isEmpty

  def distinctDiffCount(diff: InteractionsGroupedByDiff) = diff.keys.size

  type DiffsGroupedByRegion = Map[DiffLocation, Iterable[InteractionDiffResult]]
}


@JSExport
@JSExportAll
case class DiffRegionsHelpers(diffsGroupedByRegion: DiffsGroupedByRegion) {
  def keys(): Seq[DiffLocation] = diffsGroupedByRegion.keys.toSeq

  def isEmpty: Boolean = diffsGroupedByRegion.isEmpty

  def allCount: Int = diffsGroupedByRegion.flatMap(_._2).size

  def unmatchedRequestContentType: Iterable[InteractionDiffResult] = diffsGroupedByRegion.collect {
    case (DiffInRequestUnmatchedContentType, b) => b
  }.flatten

  def unmatchedResponseContentType: Iterable[InteractionDiffResult] = diffsGroupedByRegion.collect {
    case (DiffInResponseWithStatusCodeAndUnmatchedContentType(_), b) => b
  }.flatten

  def inRequest: Iterable[InteractionDiffResult] = diffsGroupedByRegion.collect {
    case (DiffInRequest, b) => b
    case (DiffInRequestWithContentType(_), b) => b
  }.flatten

  def inRequestWithContentType(contentType: String): Iterable[InteractionDiffResult] = diffsGroupedByRegion.collect {
    case (DiffInRequestWithContentType(_contentType), b) if _contentType == contentType => b
  }.flatten

  def inResponseWithStatusCode(statusCode: Int): Iterable[InteractionDiffResult] = diffsGroupedByRegion.collect {
    case (DiffInResponseWithStatusCode(_statusCode), b) if _statusCode == statusCode => b
    case (DiffInResponseShape(_statusCode, _), b) if _statusCode == statusCode => b
  }.flatten

  def inResponseWithStatusCodeAndContentType(statusCode: Int, contentType: String): Iterable[InteractionDiffResult] = diffsGroupedByRegion.collect {
    case (DiffInResponseShape(_statusCode, _contentType), b) if _statusCode == statusCode && _contentType == contentType => b
  }.flatten

  def statusCodes: Seq[Int] = diffsGroupedByRegion.collect {
    case (DiffInResponseWithStatusCode(statusCode), b) => statusCode
    case (DiffInResponseShape(statusCode, _), b) => statusCode
  }.toSeq.distinct.sorted

  def responseContentTypes: Seq[String] = diffsGroupedByRegion.collect {
    case (DiffInResponseShape(_, contentType), b) => contentType
  }.toSeq.distinct.sorted

  def responseContentTypesForStatusCode(statusCode: Int): Seq[String] = diffsGroupedByRegion.collect {
    case (DiffInResponseShape(_statusCode, contentType), b) if _statusCode == statusCode => contentType
  }.toSeq.distinct.sorted

  def requestContentTypes: Seq[String] = diffsGroupedByRegion.collect {
    case (DiffInRequestWithContentType(contentType), b) => contentType
  }.toSeq.distinct.sorted

  def inResponseBodyShape(statusCode: Int, contentType: String = null) = {
    if (contentType == null) {
      Iterable.empty
    } else {
      diffsGroupedByRegion.collect {
        case (DiffInResponseShape(_statusCode, _contentType), b) if _statusCode == statusCode && _contentType == contentType => b
      }.flatten
    }
  }

  def withHashes(hashes: Seq[String]) = {
    diffsGroupedByRegion.collect {
      case (_, b) => b.filter(i => hashes.contains(i.toHash))
    }.flatten
  }


}

trait DiffLocation

case object UnmatchedUrl extends DiffLocation

case object UnmatchedMethod extends DiffLocation

case object DiffInRequest extends DiffLocation

case object DiffInRequestUnmatchedContentType extends DiffLocation

case class DiffInRequestWithContentType(contentType: String) extends DiffLocation

case class DiffInRequestShape(contentType: String) extends DiffLocation

case class DiffInResponseWithStatusCode(statusCode: Int) extends DiffLocation

case class DiffInResponseWithStatusCodeAndUnmatchedContentType(statusCode: Int) extends DiffLocation

case class DiffInResponseShape(statusCode: Int, contentType: String) extends DiffLocation


@JSExport
@JSExportAll
case class DiffResultHelpers(interactionsGroupedByDiff: InteractionsGroupedByDiff) {
  def listRegions(): DiffRegionsHelpers = {
    val groupedKeys = interactionsGroupedByDiff.keys.groupBy {
      case d: UnmatchedRequestUrl => UnmatchedUrl
      case d: UnmatchedRequestMethod => UnmatchedMethod
      case d: UnmatchedRequestBodyContentType => DiffInRequestUnmatchedContentType
      case d: UnmatchedRequestBodyShape => DiffInRequestShape(d.interactionTrail.requestContentType())
      case d: UnmatchedResponseStatusCode => DiffInResponseWithStatusCode(d.interactionTrail.statusCode())
      case d: UnmatchedResponseBodyContentType => DiffInResponseWithStatusCodeAndUnmatchedContentType(d.interactionTrail.statusCode())
      case d: UnmatchedResponseBodyShape => DiffInResponseShape(d.interactionTrail.statusCode(), d.interactionTrail.responseContentType())
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
