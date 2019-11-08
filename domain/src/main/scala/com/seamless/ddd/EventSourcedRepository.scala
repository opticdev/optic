package com.seamless.ddd

import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.serialization.EventSerialization
import io.circe.Json

import scala.scalajs.js.annotation.JSExport

class EventSourcedRepository[State, Event](aggregate: EventSourcedAggregate[State, _, _, Event], eventStore: EventStore[Event]) {

  private val _snapshotStore = scala.collection.mutable.HashMap[String, Snapshot[State]]()

  def hasId(id: AggregateId) = eventStore.hasId(id)

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

  def clearId(id: String) = {
    eventStore.remove(id)
  }

}

abstract class EventStore[Event] {
  def remove(id: AggregateId): Unit

  def hasId(id: AggregateId): Boolean

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

  @JSExport
  def bulkAdd(id: AggregateId, eventsString: String): Unit = {
    import io.circe.parser._

    val events = for {
      json <- parse(eventsString)
      events <- EventSerialization.fromJson(json).toEither
    } yield events

    _store.put(id, scala.collection.mutable.ListBuffer[Event](events.right.get.asInstanceOf[Vector[Event]]: _*))
  }

  def fromJson(id: AggregateId, eventsJson: Json): Unit = {

    val events = for {
      events <- EventSerialization.fromJson(eventsJson).toEither
    } yield events

    _store.put(id, scala.collection.mutable.ListBuffer[Event](events.right.get.asInstanceOf[Vector[Event]]: _*))
  }

  @JSExport
  def serializeEvents(id: AggregateId) = EventSerialization.toJson(listEvents(id).asInstanceOf[Vector[RfcEvent]]).noSpaces

  override def hasId(id: AggregateId): Boolean = _store.isDefinedAt(id)

  @JSExport
  override def remove(id: AggregateId): Unit = _store.remove(id)
}


case class Snapshot[State](lastState: State, offset: Int)