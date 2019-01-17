package com.useoptic.proxy.collection

import com.useoptic.common.spec_types.{APIDescription, OpticAPISpec}
import com.useoptic.common.spec_types.reporting.AnalysisReport
import com.useoptic.proxy.OpticAPIConfiguration

object CollectionSessionManager {

  private var _session: Option[CollectionSession] = None
  def isRunning = _session.isDefined
  def reset = _session = None

  def session = _session.get

  def startSession(configuration: OpticAPIConfiguration) =
    _session = Some(new CollectionSession(configuration))

}

class CollectionSession(val configuration: OpticAPIConfiguration) {

  private val _startMillis = System.currentTimeMillis()


  private val _log = scala.collection.mutable.ListBuffer[APIInteraction]()
  def logInteraction(apiInteraction: APIInteraction) = _log.append(apiInteraction)
  def log = _log
  def reset = _log.clear()

  def finish: OpticAPISpec = {
    implicit val errorAccumulator = new ErrorAccumulator()

    val endpoints = BuildAPISpec.endPointsFromInteractions(_log.toVector, configuration)
    val failedEndpointParsing = endpoints.collect{case s if s.isFailure => s}

    val mergedEndpoints = BuildAPISpec.mergeEndpoints(endpoints.collect{case s if s.isSuccess => s.get})

    val authenticationSchemes = configuration.authenticationSchemes

    val report = AnalysisReport(
      _log.size,
      mergedEndpoints.groupBy(_.id).mapValues(_.size),
      (configuration.paths.map(_.path).toSet diff mergedEndpoints.map(_.url).toSet).toVector,
      System.currentTimeMillis() - _startMillis)

    OpticAPISpec(
      APIDescription(None, None, None),
      BuildAPISpec.applyAuthentication(mergedEndpoints.toVector, configuration),
      authenticationSchemes,
      report
    )
  }
}