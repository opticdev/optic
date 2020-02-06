package com.useoptic.contexts.rfc.projections
import com.useoptic.contexts.rfc.Events.{APINamed, ContributionAdded, RfcEvent}
import com.useoptic.ddd.Projection

object APINameProjection extends Projection[RfcEvent, String] {
  override def fromEvents(events: Vector[RfcEvent]): String = {
    nameFrom("Unnamed API", events)
  }

  override def withInitialState(initialState: String, events: Vector[RfcEvent]): String = {
    nameFrom(initialState, events)
  }

  def nameFrom(initialName: String, events: Vector[RfcEvent]): String = {
    events.foldLeft(initialName) {
      case (_, event: APINamed) => event.name
      case (current, _) => current
    }
  }
}
