package com.useoptic.coverage

import com.useoptic.diff.interactions.InteractionDiffResult
import com.useoptic.dsa.Counter

import scala.scalajs.js.annotation.{JSExport, JSExportAll, JSExportTopLevel}


@JSExport
@JSExportAll
case class CoverageReport(coverageCounts: Counter[CoverageConcerns], diffs: Counter[InteractionDiffResult]) {
  def merge(report: CoverageReport): Unit = {
    coverageCounts.merge(report.coverageCounts)
    diffs.merge(report.diffs)
  }
}

@JSExportTopLevel("CoverageReportBuilder")
@JSExportAll
object CoverageReportBuilder {
  def emptyReport(): CoverageReport = CoverageReport(new Counter[CoverageConcerns], new Counter[InteractionDiffResult])
}
