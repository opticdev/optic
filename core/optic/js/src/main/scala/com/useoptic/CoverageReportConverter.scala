package com.useoptic

import com.useoptic.coverage.CoverageConcerns
import com.useoptic.diff.interactions.InteractionDiffResult
import com.useoptic.diff.interactions.visitors.CoverageReport
import com.useoptic.dsa.Counter
import io.circe.Encoder
import io.circe.scalajs.convertJsonToJs
import io.circe.generic.auto._
import io.circe.syntax._

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
class CoverageReportConverter(hashableWrapper: StableHashableWrapper) {
  implicit val diffResultConverter: Encoder[Counter[InteractionDiffResult]] = x => {
    val dictionary = x.counts.map(entry => {
      val (k, v) = entry
      (hashableWrapper.hash(k), v)
    })
    dictionary.asJson
  }
  implicit val coverageCountsConverter: Encoder[Counter[CoverageConcerns]] = x => {
    val dictionary = x.counts.map(entry => {
      val (k, v) = entry
      (hashableWrapper.hash(k), v)
    })
    dictionary.asJson
  }


  def toJs(report: CoverageReport) = {
    convertJsonToJs(report.asJson)
  }
}
