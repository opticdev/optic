package com.useoptic.contexts.rfc

import com.useoptic.ddd.{Effects, EventSourcedAggregate}
import com.useoptic.dsa.OpticDomainIds

object Composition {
  def forwardTo[State, Command, CommandContext, Event]
  (aggregate: EventSourcedAggregate[State, Command, CommandContext, Event])
  (command: (CommandContext, Command), state: State)(implicit ids: OpticDomainIds) : Effects[Event] = {
    if (aggregate.handleCommand(state)(ids).isDefinedAt(command)) {
      aggregate.handleCommand(state)(ids)(command)
    } else {
      Effects(Vector())
    }
  }
}
