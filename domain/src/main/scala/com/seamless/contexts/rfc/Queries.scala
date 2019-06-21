package com.seamless.contexts.rfc

import io.circe.generic.auto._
import io.circe.syntax._
import com.seamless.contexts.data_types.Commands.ConceptId
import com.seamless.contexts.data_types.Events.DataTypesEvent
import com.seamless.contexts.data_types.{DataTypesAggregate, DataTypesState}
import com.seamless.contexts.data_types.projections.{AllConcepts, ConceptListProjection, NamedConcept, ShapeProjection, SingleConcept}
import com.seamless.contexts.requests.Commands.{PathComponentId, RequestId, ResponseId}
import com.seamless.contexts.requests.Commands.{PathComponentId, RequestId, RequestParameterId, ResponseId}
import com.seamless.contexts.requests.Events.RequestsEvent
import com.seamless.contexts.requests.{HttpRequest, HttpRequestParameter, HttpResponse, RequestsAggregate, RequestsState}
import com.seamless.contexts.requests.projections.{Path, PathListProjection, PathsWithRequestsProjection}
import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.contexts.rfc.projections.{APINameProjection, ContributionWrapper, ContributionsProjection}
import com.seamless.ddd.{AggregateId, CachedProjection, EventStore}

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExportAll, JSExportTopLevel}
import scala.util.Try

@JSExportTopLevel("com.seamless.contexts.rfc.Queries")
@JSExportAll
class QueriesFacade(eventStore: EventStore[RfcEvent], service: RfcService, aggregateId: AggregateId) {
  private val q = new Queries(eventStore, service, aggregateId)

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

  def conceptById(conceptId: ConceptId): js.Any = {
    import io.circe.scalajs.convertJsonToJs
    convertJsonToJs(q.conceptById(conceptId).asJson)
  }

  def apiName(): String = {
    q.apiName()
  }

}

class Queries(eventStore: EventStore[RfcEvent], service: RfcService, aggregateId: AggregateId) {

  private def events = {
    eventStore.listEvents(aggregateId)
  }

  private val pathsProjectionCache = new CachedProjection(PathListProjection, events)
  def paths: Vector[Path] = {
    pathsProjectionCache.updateProjection(events)
  }

  private val pathsWithRequestsCache = new CachedProjection(PathsWithRequestsProjection, events)
  def pathsWithRequests: Map[RequestId, PathComponentId] = {
    pathsWithRequestsCache.updateProjection(events)
  }

  private val conceptListCache = new CachedProjection(ConceptListProjection, events)
  def concepts: Vector[NamedConcept] = {
    conceptListCache.updateProjection(events)
  }

  private val contributionsCache = new CachedProjection(ContributionsProjection, events)
  def contributions: ContributionWrapper = {
    contributionsCache.updateProjection(events)
  }

  def requestsState: RequestsState = {
    service.currentState(aggregateId).requestsState
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
    ShapeProjection.all(service.currentState(aggregateId).dataTypesState)
  }

  def conceptById(conceptId: ConceptId): SingleConcept = {
    ShapeProjection.byId(service.currentState(aggregateId).dataTypesState, conceptId)
  }

  private val apiNameCache = new CachedProjection(APINameProjection, events)
  def apiName(): String = {
    apiNameCache.updateProjection(events)
  }

}