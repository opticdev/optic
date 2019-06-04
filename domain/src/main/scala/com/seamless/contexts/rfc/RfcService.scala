package com.seamless.contexts.rfc

import com.seamless.contexts.data_types.Commands.{ConceptId, DataTypesCommand}
import com.seamless.contexts.data_types.DataTypesState
import com.seamless.contexts.data_types.projections.ShapeProjection
import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.ddd.{AggregateId, EventSourcedRepository, EventSourcedService, InMemoryEventStore}

import scala.scalajs.js
import scala.scalajs.js.annotation.JSExport

class RfcService extends EventSourcedService[RfcCommand, RfcState] {
  private val eventStore = new InMemoryEventStore[RfcEvent]
  private val repository = new EventSourcedRepository[RfcState, RfcEvent](RfcAggregate, eventStore)

  def handleCommand(id: AggregateId, command: RfcCommand): Unit = {
    val state = repository.findById(id)
    val effects = RfcAggregate.handleCommand(state)(command)
    repository.save(id, effects.eventsToPersist)
  }

  def currentState(id: AggregateId): RfcState = {
    repository.findById(id)
  }

  @JSExport
  def commandHandlerForAggregate(id: AggregateId): js.Function1[RfcCommand, Unit] = (command: RfcCommand) => {
    handleCommand(id, command)
  }

  //Queries
  @JSExport
  def currentShapeProjection(id: AggregateId, conceptId: ConceptId): ShapeProjection = {
    ShapeProjection.fromState(currentState(id).restState.dataTypesState, conceptId)
  }

}
