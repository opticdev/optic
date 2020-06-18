package com.useoptic.contexts.requests

import com.useoptic.contexts.requests.Commands.RequestsCommand
import com.useoptic.contexts.requests.Events.RequestsEvent
import com.useoptic.contexts.shapes.{ShapesService, ShapesState}
import com.useoptic.ddd.{AggregateId, EventSourcedRepository, InMemoryEventStore}
import com.useoptic.dsa.{OpticDomainIds, RandomAlphanumericIdGenerator}

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

//STRICTLY FOR TESTING (because everything should go through the root (RfcService))
class RequestsService(shapesService: ShapesService)(implicit ids: OpticDomainIds) {
  private val eventStore = new InMemoryEventStore[RequestsEvent]
  private val repository = new EventSourcedRepository[RequestsState, RequestsEvent](RequestsAggregate, eventStore)

  def handleCommand(id: AggregateId, command: RequestsCommand): Unit = {
    val shapesState: ShapesState = shapesService.currentState(id)
    val state = repository.findById(id)
    val effects = RequestsAggregate.handleCommand(state)(ids)((RequestsCommandContext("a", "b", "c", shapesState), command))
    repository.save(id, effects.eventsToPersist)
  }

  def currentState(id: AggregateId): RequestsState = {
    repository.findById(id)
  }
}

@JSExport
@JSExportAll
object RequestsServiceHelper {
//  val pathIdGenerator = new RandomAlphanumericIdGenerator("path", "_", 10)
//  val requestIdGenerator = new RandomAlphanumericIdGenerator("request", "_", 10)
//  val responseIdGenerator = new RandomAlphanumericIdGenerator("response", "_", 10)
//  val parameterIdGenerator = new RandomAlphanumericIdGenerator("parameter", "_", 10)
//
//  def newPathId(): String = pathIdGenerator.nextId()
//
//  def newRequestId(): String = requestIdGenerator.nextId()
//
//  def newResponseId(): String = responseIdGenerator.nextId()
//
//  def newParameterId(): String = parameterIdGenerator.nextId()
}
