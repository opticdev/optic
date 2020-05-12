package com.useoptic.diff.helpers

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.diff.interactions.Traverser
import com.useoptic.diff.interactions.visitors.{CoverageReport, CoverageVisitors}
import com.useoptic.types.capture.HttpInteraction

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
class CoverageHelpers {
  def getCoverage(rfcState: RfcState, interactions: Seq[HttpInteraction]): CoverageReport = {
    val visitors = new CoverageVisitors()
    val traverser = new Traverser(rfcState, visitors)
    interactions.foreach(interaction => traverser.traverse(interaction))
    visitors.report
  }
}
