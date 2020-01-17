package com.useoptic.contexts.rfc

import com.useoptic.ddd.{Effects, EventSourcedAggregate}

object Composition {
  def forwardTo[State, Command, CommandContext, Event]
  (aggregate: EventSourcedAggregate[State, Command, CommandContext, Event])
  (command: (CommandContext, Command), state: State) : Effects[Event] = {
    if (aggregate.handleCommand(state).isDefinedAt(command)) {
      aggregate.handleCommand(state)(command)
    } else {
      Effects(Vector())
    }
  }
}
