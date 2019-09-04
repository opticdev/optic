package com.seamless.diff

import com.seamless.contexts.requests.Utilities
import com.seamless.contexts.rfc.Events._
import com.seamless.contexts.rfc._
import com.seamless.ddd.InMemoryEventStore

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
class SessionDiffer(rawEvents: String) {
  val rfcId = "abc"
  val eventStore = new InMemoryEventStore[RfcEvent]()
  eventStore.bulkAdd(rfcId, rawEvents)
  val rfcService = new RfcService(eventStore)
  val rfcState = rfcService.currentState(rfcId)

  def hasDiff(interaction: ApiInteraction): Boolean = {
    RequestDiffer.compare(interaction, rfcState) match {
      case RequestDiffer.NoDiff() => false
      case _ => true
    }
  }

  def hasUnrecognizedPath(interaction: ApiInteraction): Boolean = {
    Utilities.resolvePath(interaction.apiRequest.url, rfcState.requestsState.pathComponents) match {
      case None => true
      case Some(x) => false
    }
  }
}
