package com.seamless.ddd

class EventSourcedRepository[State, Event](aggregate: EventSourcedAggregate[State, _, _, Event], eventStore: EventStore[Event]) {

  private val _snapshotStore = scala.collection.mutable.HashMap[String, Snapshot[State]]()

  def findById(id: AggregateId): State = {
    val events = eventStore.listEvents(id)

    val snapshotOption = _snapshotStore.get(id)

    if (snapshotOption.isDefined) {
      val snapshot = snapshotOption.get

      val state = events.slice(snapshot.offset, events.size).foldLeft(snapshot.lastState) {
        case (state, event) => aggregate.applyEvent(event, state)
      }

      _snapshotStore.put(id, Snapshot(state, events.size))
      state

    } else {

      val state = events.foldLeft(aggregate.initialState) {
        case (state, event) => aggregate.applyEvent(event, state)
      }

      _snapshotStore.put(id, Snapshot(state, events.size))
      state
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

case class Snapshot[State](lastState: State, offset: Int)