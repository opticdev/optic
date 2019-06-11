package com.seamless.ddd

case class Effects[Event](eventsToPersist: Vector[Event])

trait EventSourcedAggregate[State, Command, CommandContext, Event] {
  def handleCommand(state: State, commandContext: CommandContext): PartialFunction[Command, Effects[Event]]
  def applyEvent(event: Event, state: State): State
  def initialState: State

  //helpers
  def persist(events: Event*): Effects[Event] = Effects(eventsToPersist = Vector(events:_*))
  def noEffect(): Effects[Event] = Effects(Vector())
}