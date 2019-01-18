package com.useoptic.common.spec_types.reporting

case class AnalysisReport(observations: Int, byPath: Map[String, Int], unusedPaths: Vector[String], durationMS: Long)
case class EndpointReport(observations: Int, statusObservations: Map[String, Int])


object AnalysisReport {
  def empty = AnalysisReport(0, Map(), Vector(), 0)
}