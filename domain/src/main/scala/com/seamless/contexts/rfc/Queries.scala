package com.seamless.contexts.rfc

import io.circe.generic.auto._
import io.circe.syntax._
import com.seamless.contexts.data_types.Commands.ConceptId
import com.seamless.contexts.data_types.Events.DataTypesEvent
import com.seamless.contexts.data_types.{DataTypesAggregate, DataTypesState}
import com.seamless.contexts.data_types.projections.{AllConcepts, ConceptListProjection, NamedConcept, ShapeProjection}
import com.seamless.contexts.requests.Commands.{PathComponentId, RequestId, ResponseId}
import com.seamless.contexts.data_types.projections.{ConceptListProjection, NamedConcept, ShapeProjection}
import com.seamless.contexts.requests.Commands.{PathComponentId, RequestId, RequestParameterId, ResponseId}
import com.seamless.contexts.requests.Events.RequestsEvent
import com.seamless.contexts.requests.{HttpRequest, HttpRequestParameter, HttpResponse, RequestsAggregate, RequestsState}
import com.seamless.contexts.requests.projections.{Path, PathListProjection, PathsWithRequestsProjection}
import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.contexts.rfc.projections.{APINameProjection, ContributionWrapper, ContributionsProjection}
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

  def pathsWithRequests(): js.Dictionary[PathComponentId] = {
    q.pathsWithRequests.toJSDictionary
  }

  def requestsState(): js.Any = {
    import io.circe.scalajs.convertJsonToJs
    convertJsonToJs(q.requestsState.asJson)
  }

  def requests(): js.Any = {
    import io.circe.scalajs.convertJsonToJs
    convertJsonToJs(q.requests.asJson)
  }

  def requestParameters(): js.Any = {
    import io.circe.scalajs.convertJsonToJs
    convertJsonToJs(q.requestParameters.asJson)
  }

  def responses(): js.Any = {
    import io.circe.scalajs.convertJsonToJs
    convertJsonToJs(q.responses.asJson)
  }

  def concepts(): js.Array[NamedConcept] = {
    q.concepts.toJSArray
  }

  def contributions(): ContributionWrapper = {
    q.contributions
  }

  def allConcepts(): js.Any = {
    import io.circe.scalajs.convertJsonToJs
    convertJsonToJs(q.allConcepts.asJson)
  }

  def apiName(): String = {
    q.apiName()
  }

}

class Queries(eventStore: EventStore[RfcEvent], aggregateId: AggregateId) {

  private def events = {
    println("full event scan")
    eventStore.listEvents(aggregateId)
  }

  def paths: Vector[Path] = {
    PathListProjection.fromEvents(events)
  }

  def pathsWithRequests: Map[RequestId, PathComponentId] = {
    PathsWithRequestsProjection.fromEvents(events)
  }

  def concepts: Vector[NamedConcept] = {
    ConceptListProjection.fromEvents(events)
  }

  def contributions: ContributionWrapper = {
    ContributionsProjection.fromEvents(events)
  }

  def requestsState: RequestsState = {
    val filteredEvents = events.collect { case requestsEvent: RequestsEvent => requestsEvent }

    filteredEvents.foldLeft(RequestsAggregate.initialState) {
      case (state, event) => RequestsAggregate.applyEvent(event, state)
    }
  }

  def requests: Map[RequestId, HttpRequest] = {
    requestsState.requests
  }

  def requestParameters: Map[RequestParameterId, HttpRequestParameter] = {
    requestsState.requestParameters
  }

  def responses: Map[ResponseId, HttpResponse] = {
    requestsState.responses
  }

  def allConcepts: AllConcepts = {
    val filteredEvents = events.collect{ case dataTypesEvent: DataTypesEvent => dataTypesEvent }

    val state = filteredEvents.foldLeft(DataTypesState(Map.empty, Map.empty)) { case (state, event) =>
      DataTypesAggregate.applyEvent(event, state)
    }

    ShapeProjection.fromState(state)
  }

  def apiName(): String = {
    APINameProjection.fromEvents(events)
  }

}