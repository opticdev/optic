package com.seamless.contexts.requests

import com.seamless.contexts.requests.Commands.RequestsCommand
import com.seamless.contexts.requests.Events.RequestsEvent
import com.seamless.contexts.shapes.{ShapesService, ShapesState}
import com.seamless.ddd.{AggregateId, EventSourcedRepository, InMemoryEventStore}

import scala.scalajs.js.annotation.{JSExport, JSExportAll}
import scala.util.Random

//STRICTLY FOR TESTING (because everything should go through the root (RfcService))
class RequestsService(shapesService: ShapesService) {
  private val eventStore = new InMemoryEventStore[RequestsEvent]
  private val repository = new EventSourcedRepository[RequestsState, RequestsEvent](RequestsAggregate, eventStore)

  def handleCommand(id: AggregateId, command: RequestsCommand): Unit = {
    val shapesState: ShapesState = shapesService.currentState(id)
    val state = repository.findById(id)
    val effects = RequestsAggregate.handleCommand(state)((RequestsCommandContext(shapesState), command))
    repository.save(id, effects.eventsToPersist)
  }

  def currentState(id: AggregateId): RequestsState = {
    repository.findById(id)
  }
}
@JSExport
@JSExportAll
object RequestsServiceHelper {
  def newId(): String = s"request_${Random.alphanumeric take 10 mkString}"
}