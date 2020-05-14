package com.useoptic

import com.useoptic.coverage.CoverageConcerns
import com.useoptic.diff.interactions.InteractionDiffResult
import com.useoptic.coverage.CoverageReport
import com.useoptic.dsa.Counter
import io.circe.{Decoder, Encoder, Json}
import io.circe.scalajs.{convertJsToJson, convertJsonToJs}
import io.circe.generic.auto._
import io.circe.syntax._

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExport, JSExportAll, JSExportTopLevel}

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

@JSExportTopLevel("CoverageReportJsonSerializer")
@JSExportAll
object CoverageReportJsonSerializer {
  implicit val diffResultEncoder: Encoder[Counter[InteractionDiffResult]] = x => {
    x.counts.toVector.asJson
  }
  implicit val coverageCountsEncoder: Encoder[Counter[CoverageConcerns]] = x => {
    x.counts.toVector.asJson
  }

  def toJson(report: CoverageReport): Json = {
    report.asJson
  }

  def toJs(report: CoverageReport): js.Any = {
    convertJsonToJs(report.asJson)
  }
}

@JSExportTopLevel("CoverageReportJsonDeserializer")
@JSExportAll
object CoverageReportDeserializer {

  implicit val diffResultDecoder: Decoder[Counter[InteractionDiffResult]] = x => {
    val counts = scala.collection.mutable.Map[InteractionDiffResult, Int](x.as[Seq[(InteractionDiffResult, Int)]].right.get: _*)
    val counter = new Counter[InteractionDiffResult]
    counter.counts = counts
    Right(counter)
  }
  implicit val coverageCountsDecoder: Decoder[Counter[CoverageConcerns]] = x => {
    val counts = scala.collection.mutable.Map[CoverageConcerns, Int](x.as[Seq[(CoverageConcerns, Int)]].right.get: _*)
    val counter = new Counter[CoverageConcerns]
    counter.counts = counts
    Right(counter)
  }
  def fromJson(x: Json): CoverageReport = {
    x.as[CoverageReport].right.get
  }

  def fromJs(x: js.Any) = {
    fromJson(convertJsToJson(x).right.get)
  }
}
