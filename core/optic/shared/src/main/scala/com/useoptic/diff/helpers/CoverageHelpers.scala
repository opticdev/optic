package com.useoptic.diff.helpers

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.diff.interactions.{Resolvers, Traverser}
import com.useoptic.diff.interactions.visitors.{CoverageReport, CoverageVisitors, DiffVisitors}
import com.useoptic.diff.shapes.{MemoizedResolvers, SpecResolvers}
import com.useoptic.types.capture.HttpInteraction

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
class CoverageHelpers {
  def getCoverage(rfcState: RfcState, interactions: Seq[HttpInteraction]): CoverageReport = {

    implicit val Resolvers: SpecResolvers = new MemoizedResolvers(rfcState)
    val visitors = new CoverageVisitors()
    val traverser = new Traverser(rfcState, visitors)
    interactions.foreach(interaction => traverser.traverse(interaction))
    visitors.report
  }
}
