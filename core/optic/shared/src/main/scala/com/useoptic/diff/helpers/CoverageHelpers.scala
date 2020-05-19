package com.useoptic.diff.helpers

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.coverage.CoverageReport
import com.useoptic.diff.interactions.Traverser
import com.useoptic.diff.interactions.visitors.CoverageVisitors
import com.useoptic.diff.shapes.resolvers.ShapesResolvers
import com.useoptic.types.capture.HttpInteraction

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
class CoverageHelpers {
  def getCoverage(resolvers: ShapesResolvers, rfcState: RfcState, interactions: Seq[HttpInteraction]): CoverageReport = {
    val visitors = new CoverageVisitors(resolvers)
    val traverser = new Traverser(rfcState, visitors)
    interactions.foreach(interaction => traverser.traverse(interaction))
    visitors.report
  }
}
