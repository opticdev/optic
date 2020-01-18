package com.useoptic.contexts.rfc

import com.useoptic.contexts.rfc.Commands.RfcCommand
import com.useoptic.contexts.rfc.Events.RfcEvent
import com.useoptic.ddd._
import com.useoptic.serialization.CommandSerialization

import scala.scalajs.js.annotation.{JSExport, JSExportAll}
import scala.util.Try

class RfcService(eventStore: EventStore[RfcEvent]) extends EventSourcedService[RfcCommand, RfcCommandContext, RfcState] {
  private val repository = new EventSourcedRepository[RfcState, RfcEvent](RfcAggregate, eventStore)
  def handleCommand(id: AggregateId, command: RfcCommand, context: RfcCommandContext): Unit = {
    val state = repository.findById(id)
    val effects = RfcAggregate.handleCommand(state)((context, command))
    repository.save(id, effects.eventsToPersist)
  }

  def currentState(id: AggregateId): RfcState = {
    repository.findById(id)
  }

  def listEvents(id: AggregateId) = eventStore.listEvents(id)
}

@JSExport
@JSExportAll
object RfcServiceJSFacade {

  def makeEventStore() = {
    new InMemoryEventStore[RfcEvent]
  }

  def fromCommands(eventStore: EventStore[RfcEvent], aggregateId: AggregateId, commands: Vector[RfcCommand], commandContext: RfcCommandContext): RfcService = {
    val service = new RfcService(eventStore)
    commands.foreach(command => {
      val result = Try(service.handleCommand(aggregateId, command, commandContext))
      if (result.isFailure) {
//        println(command)
//        println(result)
        throw result.failed.get
      }
    })
    service
  }

  def fromJsonCommands(eventStore: EventStore[RfcEvent], aggregateId: AggregateId, jsonString: String, commandContext: RfcCommandContext): RfcService = {
    val commands = CommandSerialization.fromJsonString(jsonString)

    fromCommands(eventStore, aggregateId, commands, commandContext)
  }
}

