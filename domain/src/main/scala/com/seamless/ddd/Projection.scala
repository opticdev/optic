package com.seamless.ddd

trait Projection[Event, T] {
  def fromEvents(events: Vector[Event]): T

  def withInitialState(initialState: T, events: Vector[Event]): T
}
