package com.useoptic.diff

import com.useoptic.contexts.requests.Utilities
import com.useoptic.contexts.rfc.Events._
import com.useoptic.contexts.rfc._
import com.useoptic.ddd.InMemoryEventStore
import com.useoptic.diff.helpers.DiffHelpers
import com.useoptic.types.capture.HttpInteraction

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
class InteractionDiffer(rfcState: RfcState) {

  def hasDiff(interaction: HttpInteraction): Boolean = {
    DiffHelpers.diff(rfcState, interaction).nonEmpty
  }

  def hasUnrecognizedPath(interaction: HttpInteraction): Boolean = {
    Utilities.resolvePath(interaction.request.path, rfcState.requestsState.pathComponents) match {
      case None => true
      case Some(x) => false
    }
  }
}

@JSExport
@JSExportAll
class SessionDiffer(rawEvents: String) {
  val rfcId = "abc"
  val eventStore = new InMemoryEventStore[RfcEvent]()
  eventStore.bulkAdd(rfcId, rawEvents)
  val rfcService = new RfcService(eventStore)
  val rfcState = rfcService.currentState(rfcId)
  val interactionDiffer = new InteractionDiffer(rfcState)

  def hasDiff(interaction: HttpInteraction): Boolean = {
    interactionDiffer.hasDiff(interaction)
  }

  def hasUnrecognizedPath(interaction: HttpInteraction): Boolean = {
    interactionDiffer.hasUnrecognizedPath(interaction)
  }
}
