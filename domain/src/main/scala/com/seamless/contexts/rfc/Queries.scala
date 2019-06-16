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
import scala.util.Try

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

  def conceptsById(conceptId: ConceptId): js.UndefOr[ShapeProjection] = {
    q.conceptsById(conceptId).orUndefined
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

  def conceptsById(conceptId: ConceptId): Option[ShapeProjection] = {
    val filteredEvents = events.collect{ case dataTypesEvent: DataTypesEvent => dataTypesEvent }

    val state = filteredEvents.foldLeft(DataTypesState(Map.empty, Map.empty)) { case (state, event) =>
      DataTypesAggregate.applyEvent(event, state)
    }

    Try(ShapeProjection.fromState(state, conceptId)).toOption
  }

}