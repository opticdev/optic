package com.seamless.contexts.rest

import com.seamless.contexts.rest.Commands.RestCommand
import com.seamless.contexts.rest.Events.RestEvent
import com.seamless.ddd.{AggregateId, EventSourcedRepository, EventSourcedService, InMemoryEventStore}

import scala.util.Random


class RestService extends EventSourcedService[RestCommand, RestState] {
  private val eventStore = new InMemoryEventStore[RestEvent]
  private val repository = new EventSourcedRepository[RestState, RestEvent](RestAggregate, eventStore)

  def handleCommand(id: AggregateId, command: RestCommand): Unit = {
    val state = repository.findById(id)
    val effects = RestAggregate.handleCommand(state)(command)
    repository.save(id, effects.eventsToPersist)
  }

  def currentState(id: AggregateId): RestState = {
    repository.findById(id)
  }
}

object RestServiceHelper {
  def newId(): String = s"${Random.alphanumeric take 10 mkString}"
  def newEndpointId(): String = s"endpoint_${Random.alphanumeric take 10 mkString}"
}