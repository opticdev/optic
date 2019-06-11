package com.seamless.contexts.requests

import com.seamless.contexts.data_types.{DataTypesService, DataTypesState}
import com.seamless.contexts.requests.Commands.RequestsCommand
import com.seamless.contexts.requests.Events.RequestsEvent
import com.seamless.ddd.{AggregateId, EventSourcedRepository, InMemoryEventStore}

class RequestsService(dataTypesService: DataTypesService) {
  private val eventStore = new InMemoryEventStore[RequestsEvent]
  private val repository = new EventSourcedRepository[RequestsState, RequestsEvent](RequestsAggregate, eventStore)

  def handleCommand(id: AggregateId, command: RequestsCommand): Unit = {
    val dataTypesState: DataTypesState = dataTypesService.currentState(id)
    val state = repository.findById(id)
    val effects = RequestsAggregate.handleCommand(state)(command)
    repository.save(id, effects.eventsToPersist)
  }

  def currentState(id: AggregateId): RequestsState = {
    repository.findById(id)
  }
}
