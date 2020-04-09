package com.useoptic.ddd.projections

abstract class ProjectionLogic[Event, InternalState <: InternalProjectionState] {

  def applyEvent(event: Event, state: InternalState): InternalState
  def initialState: InternalState


  private [this] val _dependencies = collection.mutable.ListBuffer[(String, ProjectionLogic[Event, InternalProjectionState])]()

  //Internal routing logic
  final def dependsOn[InternalDep <: InternalProjectionState](slug: String, projectionLogic: ProjectionLogic[Event, InternalDep]): Unit = {
    require(projectionLogic.getClass != this.getClass, "projections can't depend on themselves")
//    Logger.log(_dependencies.map(_._1))
    _dependencies append ((slug, projectionLogic.asInstanceOf[ProjectionLogic[Event, InternalProjectionState]]))
  }

  final def applyEventToDependencies(event: Event, state: InternalState): InternalState = {
    _dependencies.foreach {
      case (slug, projectionLogic) => {
        val result = projectionLogic.applyEvent(event, state.stateOfOrDefault(slug, projectionLogic.initialState))
        state.setStateFor(slug, result)
      }
    }
    state
  }

  final def applyEvents(events: Vector[Event], onToState: InternalState = initialState): InternalState = {
    events.foldLeft(onToState) {
      case (state, event) => applyEvent(event, state)
    }
  }

}

trait InternalProjectionState {
  private [this] var _dependentStates = collection.mutable.HashMap[String, InternalProjectionState]()
  def stateOf(slug: String): InternalProjectionState = _dependentStates(slug)
  def stateOfOrDefault(slug: String, default: InternalProjectionState): InternalProjectionState = _dependentStates.getOrElse(slug, default)
  def setStateFor(slug: String, state: InternalProjectionState): Unit = _dependentStates.put(slug, state)

  def dependentStates = _dependentStates.toVector
  def includeDependentStates[A <: InternalProjectionState](previous: A): A = {
    _dependentStates = collection.mutable.HashMap[String, InternalProjectionState](previous.dependentStates:_*)
    this.asInstanceOf[A]
  }
}
