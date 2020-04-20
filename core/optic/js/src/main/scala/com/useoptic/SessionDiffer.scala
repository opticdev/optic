package com.useoptic

import com.useoptic.contexts.requests.Utilities
import com.useoptic.contexts.rfc.Events._
import com.useoptic.contexts.rfc._
import com.useoptic.ddd.InMemoryEventStore
import com.useoptic.diff.helpers.DiffHelpers
import com.useoptic.serialization.InteractionSerialization.shapeHashDecoder
import com.useoptic.types.capture.HttpInteraction
import com.useoptic.ux.DiffManager

import scala.scalajs.js
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

  private def toInteraction(x: js.Any): Option[HttpInteraction] = {
    import io.circe.generic.auto._
    import io.circe.scalajs.convertJsToJson
    import shapeHashDecoder._
    convertJsToJson(x).right.get.as[HttpInteraction].right.toOption
  }

  def hasDiff(x: js.Any): Boolean = {
    toInteraction(x).exists(interactionDiffer.hasDiff)
  }

  def hasUnrecognizedPath(x: js.Any): Boolean = {
    toInteraction(x).exists(interactionDiffer.hasUnrecognizedPath)
  }
}
