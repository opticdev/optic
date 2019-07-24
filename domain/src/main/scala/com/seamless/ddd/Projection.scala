package com.seamless.ddd

trait Projection[Event, T] {
  def fromEvents(events: Vector[Event]): T
  def withInitialState(initialState: T, events: Vector[Event]): T
}

class CachedProjection[Event, T](projection: Projection[Event, T], events: Vector[Event] = Vector.empty) {

  private var lastEvent = 0
  private var lastSnapshot: Option[T] = None

  def withEvents(events: Vector[Event]): T = {
    lastSnapshot match {
      case None => {
        val result = projection.fromEvents(events)
        lastSnapshot = Some(result)
        lastEvent = events.length
        result
      }
      case Some(snapshot) => {
        val newEvents = events.slice(lastEvent, events.size)
        val result = projection.withInitialState(snapshot, newEvents)
        lastSnapshot = Some(result)
        lastEvent = events.length
        result
      }
    }
  }



  //Init
  withEvents(events)

}