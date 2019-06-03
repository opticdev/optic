package com.seamless.ddd

import com.seamless.ddd.ConceptAggregate

class EventSourcedRepository[State, Event](aggregate: EventSourcedAggregate[State, _, Event], eventStore: EventStore[Event]) {
  def findById(id: AggregateId): State = {
    val events = eventStore.listEvents(id)
    events.foldLeft(aggregate.initialState) {
      case (state, event) => aggregate.applyEvent(event, state)
    }
  }

  def save(id: AggregateId, events: Vector[Event]): Unit = {
    eventStore.append(id, events)
  }
}

abstract class EventStore[Event] {
  def listEvents(id: AggregateId): Vector[Event]

  def append(id: AggregateId, events: Vector[Event]): Unit
}

class InMemoryEventStore[Event] extends EventStore[Event] {
  private type EventStream = scala.collection.mutable.ListBuffer[Event]
  private[this] val _store = scala.collection.mutable.HashMap[AggregateId, EventStream]()

  override def listEvents(id: AggregateId): Vector[Event] = {
    _store.getOrElse(id, scala.collection.mutable.ListBuffer[Event]())
      .toVector
  }

  override def append(id: AggregateId, newEvents: Vector[Event]): Unit = {
    val events = _store.getOrElseUpdate(id, scala.collection.mutable.ListBuffer[Event]())
    events.appendAll(newEvents)
  }
}


object T {

  def main(args: Array[String]): Unit = {

  }

}