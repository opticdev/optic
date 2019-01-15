package com.useoptic.proxy.collection

object CollectionSessionManager {

  private var _session: Option[CollectionSession] = None
  def isRunning = _session.isDefined
  def reset = _session = None

  def session = _session.get

  def startSession(projectName: String, forwardTo: Option[String]) =
    _session = Some(new CollectionSession(projectName, forwardTo))

}

class CollectionSession(val projectName: String, val forwardTo: Option[String]) {
  private val _log = scala.collection.mutable.ListBuffer[APIInteraction]()
  def logInteraction(apiInteraction: APIInteraction) = _log.append(apiInteraction)
}