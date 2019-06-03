package com.seamless.ddd

case class Effects[Event](eventsToPersist: Vector[Event])

trait EventSourcedAggregate[State, Command, Event] {
  def handleCommand(state: State): PartialFunction[Command, Effects[Event]]
  def applyEvent(event: Event, state: State): State
  def initialState: State

  //helpers
  def persist(events: Event*): Effects[Event] = Effects(eventsToPersist = Vector(events:_*))
  def noEffect(): Effects[Event] = Effects(Vector())
}


object ConceptAggregate extends EventSourcedAggregate[String, String, String] {

  override def handleCommand(state: String): PartialFunction[String, Effects[String]] = {
    case "On" => Effects(Vector("turned-on"))
    case "Off" => Effects(Vector("turned-off"))
  }

  override def applyEvent(event: String, state: String): String = {
    if (event == "turned-on") {
      "turned-on"
    } else {
      "turned-off"
    }
  }

  override def initialState: String = "turned-on"
}


object Test {

  def main(args: Array[String]): Unit = {

    val sideEffects = ConceptAggregate.handleCommand("turned-off")("On")
    assert(sideEffects.eventsToPersist.size == 1)
    assert(sideEffects.eventsToPersist.head == "turned-on")

    val result = sideEffects.eventsToPersist.fold("turned-off") {
      case (state, event) => ConceptAggregate.applyEvent(event, state)
    }

    assert(result == "turned-on")

  }
}
