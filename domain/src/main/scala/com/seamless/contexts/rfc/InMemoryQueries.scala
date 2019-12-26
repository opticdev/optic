package com.seamless.contexts.rfc

import com.seamless.contexts.requests.Commands.{PathComponentId, RequestId}
import com.seamless.contexts.requests.projections.PathsWithRequestsProjection
import com.seamless.contexts.requests.{PathComponent, RequestsState, Utilities}
import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.contexts.rfc.projections.{APINameProjection, ComplexityScoreProjection, ContributionWrapper, ContributionsProjection, SetupState, SetupStateProjection}
import com.seamless.contexts.shapes.Commands.{FieldId, ShapeId}
import com.seamless.contexts.shapes.ShapesState
import com.seamless.contexts.shapes.projections.FlatShapeProjection.FlatShapeResult
import com.seamless.contexts.shapes.projections.{ExampleProjection, FlatShapeProjection, NameForShapeId, NamedShape, NamedShapes}
import com.seamless.ddd.{AggregateId, CachedProjection, EventStore}
import io.circe.Json
import io.circe.generic.auto._
import io.circe.syntax._

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExportAll, JSExportTopLevel}
import io.circe.scalajs.{convertJsToJson, convertJsonToJs}

@JSExportTopLevel("Queries")
@JSExportAll
class QueriesFacade(eventStore: EventStore[RfcEvent], service: RfcService, aggregateId: AggregateId) {
  private val q = new InMemoryQueries(eventStore, service, aggregateId)

  def pathsWithRequests(): js.Any = {
    convertJsonToJs(q.pathsWithRequests.asJson)
  }

  def requestsState(): js.Any = {
    convertJsonToJs(q.requestsState.asJson)
  }

  def shapesState(): js.Any = {
    convertJsonToJs(q.shapesState.asJson)
  }

  def namedShapes(): js.Any = {
    convertJsonToJs(q.namedShapes.asJson)
  }

  def contributions(): ContributionWrapper = {
    q.contributions
  }

  def apiName(): String = {
    q.apiName()
  }

  def shapeById(shapeId: ShapeId): js.Any = {
    convertJsonToJs(q.shapesState.flattenedShape(shapeId).asJson)
  }

  def complexityScore(): String = {
    q.complexityScore
  }

  def absolutePath(pathComponentId: PathComponentId): String = {
    q.absolutePath(pathComponentId)
  }

  def resolvePath(url: String): js.Any = {
    convertJsonToJs(q.resolvePath(url).asJson)
  }
  def nameForShapeId(shapeId: ShapeId): js.Any = {
    convertJsonToJs(q.nameForShapeId(shapeId).asJson)
  }
  def nameForFieldId(fieldId: FieldId): js.Any = {
    convertJsonToJs(q.nameForFieldId(fieldId).asJson)
  }
  def flatShapeForShapeId(shapeId: ShapeId, affectedIds: js.Array[String] = js.Array()): js.Any = {
    import js.JSConverters._
    convertJsonToJs(q.flatShapeForShapeId(shapeId, affectedIds.toSeq).asJson)
  }
  def flatShapeForExample(example: js.Any): js.Any = {
    convertJsonToJs(q.flatShapeForExample(convertJsToJson(example).right.get).asJson)
  }
  def setupState(): js.Any = {
    convertJsonToJs(q.setupState().asJson)
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

  def absolutePath(pathId: PathComponentId): String = {
    implicit val pathComponents: Map[PathComponentId, PathComponent] = service.currentState(aggregateId).requestsState.pathComponents
    Utilities.toAbsolutePath(pathId)
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

  def resolvePath(url: String) = {
    Utilities.resolvePath(url, requestsState.pathComponents)
  }

  def nameForShapeId(shapeId: ShapeId): Seq[NameForShapeId.ColoredComponent] = {
    NameForShapeId.getShapeName(shapeId)(service.currentState(aggregateId).shapesState)
  }
  def nameForFieldId(fieldId: FieldId): Seq[NameForShapeId.ColoredComponent] = {
    NameForShapeId.getFieldIdShapeName(fieldId)(service.currentState(aggregateId).shapesState)
  }
  def flatShapeForShapeId(shapeId: ShapeId, affectedIds: Seq[String] = Seq.empty): FlatShapeResult = {
    FlatShapeProjection.forShapeId(shapeId, affectedIds = affectedIds)(service.currentState(aggregateId).shapesState)
  }
  def flatShapeForExample(example: Json): FlatShapeResult = {
    ExampleProjection.fromJson(example)
  }

  private val apiSetupCache = new CachedProjection(SetupStateProjection, events)
  def setupState(): SetupState = {
    apiSetupCache.withEvents(events)
  }

}
