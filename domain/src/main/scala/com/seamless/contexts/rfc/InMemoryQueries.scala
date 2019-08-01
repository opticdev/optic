package com.seamless.contexts.rfc

import io.circe.generic.auto._
import io.circe.syntax._
import com.seamless.contexts.shapes.Commands.ShapeId
import com.seamless.contexts.shapes.ShapesState
import com.seamless.contexts.shapes.projections.{NamedShape, NamedShapes}
import com.seamless.contexts.requests.Commands.{PathComponentId, RequestId}
import com.seamless.contexts.requests.{RequestsState}
import com.seamless.contexts.requests.projections.PathsWithRequestsProjection
import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.contexts.rfc.projections.{APINameProjection, ComplexityScoreProjection, ContributionWrapper, ContributionsProjection}
import com.seamless.ddd.{AggregateId, CachedProjection, EventStore}

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExportAll, JSExportTopLevel}

@JSExportTopLevel("Queries")
@JSExportAll
class QueriesFacade(eventStore: EventStore[RfcEvent], service: RfcService, aggregateId: AggregateId) {
  private val q = new InMemoryQueries(eventStore, service, aggregateId)

  def pathsWithRequests(): js.Any = {
    import io.circe.scalajs.convertJsonToJs
    convertJsonToJs(q.pathsWithRequests.asJson)
  }

  def requestsState(): js.Any = {
    import io.circe.scalajs.convertJsonToJs
    convertJsonToJs(q.requestsState.asJson)
  }
  def shapesState(): js.Any = {
    import io.circe.scalajs.convertJsonToJs
    convertJsonToJs(q.shapesState.asJson)
  }

  def namedShapes(): js.Any = {
    import io.circe.scalajs.convertJsonToJs
    convertJsonToJs(q.namedShapes.asJson)
  }

  def contributions(): ContributionWrapper = {
    q.contributions
  }

  def apiName(): String = {
    q.apiName()
  }

  def shapeById(shapeId: ShapeId): js.Any = {
    import io.circe.scalajs.convertJsonToJs
    convertJsonToJs(q.shapesState.flattenedShape(shapeId).asJson)
  }

  def complexityScore(): String = {
    q.complexityScore
  }

}

class InMemoryQueries(eventStore: EventStore[RfcEvent], service: RfcService, aggregateId: AggregateId) {

  private def events = {
    eventStore.listEvents(aggregateId)
  }

  private val pathsWithRequestsCache = new CachedProjection(PathsWithRequestsProjection, events)
  def pathsWithRequests: Map[RequestId, PathComponentId] = {
    pathsWithRequestsCache.withEvents(events)
  }

  private val contributionsCache = new CachedProjection(ContributionsProjection, events)
  def contributions: ContributionWrapper = {
    contributionsCache.withEvents(events)
  }

  def requestsState: RequestsState = {
    service.currentState(aggregateId).requestsState
  }

  def shapesState: ShapesState = {
    service.currentState(aggregateId).shapesState
  }

  private val namedShapesCache = new CachedProjection(NamedShapes, events)
  def namedShapes: Map[ShapeId, NamedShape] = {
    namedShapesCache.withEvents(events)
  }

  def complexityScore: String = {
    ComplexityScoreProjection.calculate(pathsWithRequests, namedShapes)
  }

  private val apiNameCache = new CachedProjection(APINameProjection, events)
  def apiName(): String = {
    apiNameCache.withEvents(events)
  }
}