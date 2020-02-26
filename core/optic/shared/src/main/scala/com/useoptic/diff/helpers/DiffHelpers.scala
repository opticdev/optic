package com.useoptic.diff.helpers

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.diff.helpers.DiffHelpers.{DiffsGroupedByRegion, InteractionsGroupedByDiff}
import com.useoptic.diff.interactions.{InteractionDiffResult, Traverser, UnmatchedRequestBodyContentType, UnmatchedRequestBodyShape, UnmatchedRequestMethod, UnmatchedRequestUrl, UnmatchedResponseBodyContentType, UnmatchedResponseBodyShape, UnmatchedResponseStatusCode}
import com.useoptic.diff.interactions.visitors.DiffVisitors
import com.useoptic.types.capture.HttpInteraction

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

  type DiffsGroupedByRegion = Map[String, Iterable[InteractionDiffResult]]
}


@JSExport
@JSExportAll
case class DiffRegionsHelpers(diffsGroupedByRegion: DiffsGroupedByRegion) {
  def keys(): Seq[String] = diffsGroupedByRegion.keys.toSeq
  def get(group: String): Option[Iterable[InteractionDiffResult]] = diffsGroupedByRegion.get(group)

  override def equals(obj: Any): Boolean = {
    if (obj.isInstanceOf[DiffRegionsHelpers]) {
      obj.asInstanceOf[DiffRegionsHelpers].diffsGroupedByRegion.mapValues(_.toVector) == diffsGroupedByRegion.mapValues(_.toVector)
    } else {
      false
    }
  }
}

@JSExport
@JSExportAll
case class DiffResultHelpers(interactionsGroupedByDiff: InteractionsGroupedByDiff) {
  def listRegions(): DiffRegionsHelpers = {
    val groupedKeys = interactionsGroupedByDiff.keys.groupBy {
      case d: UnmatchedRequestUrl => "request"
      case d: UnmatchedRequestMethod => "request"
      case d: UnmatchedRequestBodyContentType => "request-body"
      case d: UnmatchedRequestBodyShape => "request-body"
      case d: UnmatchedResponseStatusCode => s"response-${d.interactionTrail.statusCode()}"
      case d: UnmatchedResponseBodyContentType => s"response-body-${d.interactionTrail.statusCode()}"
      case d: UnmatchedResponseBodyShape => s"response-body-${d.interactionTrail.statusCode()}"
      case _ => throw new Error("unimplemented")
    }
    DiffRegionsHelpers(groupedKeys)
  }

  def keys(): Seq[InteractionDiffResult] = interactionsGroupedByDiff.keySet.toSeq
  def get(diff: InteractionDiffResult): Option[Seq[HttpInteraction]] = interactionsGroupedByDiff.get(diff)
}
