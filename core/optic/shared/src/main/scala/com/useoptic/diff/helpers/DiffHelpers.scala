package com.useoptic.diff.helpers

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.diff.interactions.{InteractionDiffResult, Traverser}
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
