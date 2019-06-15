package com.seamless.contexts.rfc

import com.seamless.contexts.data_types.Commands.ConceptId
import com.seamless.contexts.data_types.Events.DataTypesEvent
import com.seamless.contexts.data_types.{DataTypesAggregate, DataTypesState}
import com.seamless.contexts.data_types.projections.{ConceptListProjection, NamedConcept, ShapeProjection}
import com.seamless.contexts.requests.projections.{Path, PathListProjection}
import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.contexts.rfc.projections.{ContributionWrapper, ContributionsProjection}
import com.seamless.ddd.{AggregateId, EventStore}

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExportAll, JSExportTopLevel}

@JSExportTopLevel("com.seamless.contexts.rfc.Queries")
@JSExportAll
class QueriesFacade(eventStore: EventStore[RfcEvent], aggregateId: AggregateId) {
  private val q = new Queries(eventStore, aggregateId)
  import js.JSConverters._

  def paths(): js.Array[Path] = {
    q.paths.toJSArray
  }

  def concepts(): js.Array[NamedConcept] = {
    q.concepts.toJSArray
  }

  def contributions(): ContributionWrapper = {
    q.contributions
  }

  def conceptsById(conceptId: ConceptId): ShapeProjection = {
    q.conceptsById(conceptId)
  }

}

class Queries(eventStore: EventStore[RfcEvent], aggregateId: AggregateId) {

  private def events = {
    eventStore.listEvents(aggregateId)
  }

  def paths: Vector[Path] = {
    PathListProjection.fromEvents(events)
  }

  def concepts: Vector[NamedConcept] = {
    ConceptListProjection.fromEvents(events)
  }

  def contributions: ContributionWrapper = {
    ContributionsProjection.fromEvents(events)
  }

  def conceptsById(conceptId: ConceptId): ShapeProjection = {
    val filteredEvents = events.collect{ case dataTypesEvent: DataTypesEvent => dataTypesEvent }

    val state = filteredEvents.foldLeft(DataTypesState(Map.empty, Map.empty)) { case (state, event) =>
      DataTypesAggregate.applyEvent(event, state)
    }

    ShapeProjection.fromState(state, conceptId)
  }

}