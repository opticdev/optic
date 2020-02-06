package com.useoptic.diff

import com.useoptic.contexts.requests.Utilities
import com.useoptic.contexts.rfc.Events._
import com.useoptic.contexts.rfc._
import com.useoptic.ddd.InMemoryEventStore

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
class InteractionDiffer(rfcState: RfcState) {

  def hasDiff(interaction: ApiInteraction, plugins: PluginRegistry = PluginRegistryUtilities.defaultPluginRegistry(rfcState.shapesState)): Boolean = {
    RequestDiffer.compare(ApiInteractionLike.fromApiInteraction(interaction), rfcState, plugins).hasNext
  }

  def hasUnrecognizedPath(interaction: ApiInteraction): Boolean = {
    Utilities.resolvePath(interaction.apiRequest.url, rfcState.requestsState.pathComponents) match {
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

  def hasDiff(interaction: ApiInteraction, plugins: PluginRegistry = PluginRegistryUtilities.defaultPluginRegistry(rfcState.shapesState)): Boolean = {
    RequestDiffer.compare(ApiInteractionLike.fromApiInteraction(interaction), rfcState, plugins).hasNext
  }

  def hasUnrecognizedPath(interaction: ApiInteraction): Boolean = {
    Utilities.resolvePath(interaction.apiRequest.url, rfcState.requestsState.pathComponents) match {
      case None => true
      case Some(x) => false
    }
  }
}
