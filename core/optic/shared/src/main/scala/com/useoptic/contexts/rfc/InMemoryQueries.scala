package com.useoptic.contexts.rfc

import com.useoptic.contexts.requests.Commands.{PathComponentId, RequestId}
import com.useoptic.contexts.requests.projections.{AllEndpointsProjection, PathsWithRequestsProjection}
import com.useoptic.contexts.requests.{PathComponent, RequestsState, Utilities}
import com.useoptic.contexts.rfc.Events.RfcEvent
import com.useoptic.contexts.rfc.projections.{APINameProjection, ComplexityScoreProjection, ContributionsProjection, SetupState, SetupStateProjection}
import com.useoptic.contexts.shapes.Commands.{FieldId, ShapeId}
import com.useoptic.contexts.shapes.ShapesState
import com.useoptic.contexts.shapes.projections.{ExampleProjection, FlatShapeProjection, FlatShapeResult, NameForShapeId, NamedShape, NamedShapes, TrailTags}
import com.useoptic.ddd.{AggregateId, CachedProjection, EventStore}
import com.useoptic.diff.interactions.ShapeRelatedDiff
import com.useoptic.diff.shapes.{JsonTrail, ShapeTrail}
import io.circe.Json
import io.circe.generic.auto._
import io.circe.syntax._

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExportAll, JSExportTopLevel}

class InMemoryQueries(eventStore: EventStore[RfcEvent], service: RfcService, aggregateId: AggregateId) {

  private def events = {
    eventStore.listEvents(aggregateId)
  }

  private val pathsWithRequestsCache = new CachedProjection(PathsWithRequestsProjection, events)

  def pathsWithRequests: Map[RequestId, PathComponentId] = {
    pathsWithRequestsCache.withEvents(events)
  }

  private val contributionsCache = new CachedProjection(ContributionsProjection, events)

  def contributions: Map[String, Map[String, String]] = {
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

  def endpoints(): Seq[AllEndpointsProjection.Endpoint] = {
    AllEndpointsProjection.fromRfcState(service.currentState(aggregateId))
  }

  def nameForShapeId(shapeId: ShapeId): Seq[NameForShapeId.ColoredComponent] = {
    NameForShapeId.getShapeName(shapeId)(service.currentState(aggregateId).shapesState)
  }
  def nameForFieldId(fieldId: FieldId): Seq[NameForShapeId.ColoredComponent] = {
    NameForShapeId.getFieldIdShapeName(fieldId)(service.currentState(aggregateId).shapesState)
  }
  def flatShapeForShapeId(shapeId: ShapeId, shapeRelatedDiffs: Seq[ShapeRelatedDiff] = Seq.empty, trailTags: TrailTags[ShapeTrail] = TrailTags(Map.empty)): FlatShapeResult = {
    FlatShapeProjection.forShapeId(shapeId, None, trailTags, shapeRelatedDiffs)(service.currentState(aggregateId).shapesState, revision = events.size)
  }
  def flatShapeForExample(example: Json, hash: String, trailTags: TrailTags[JsonTrail]= TrailTags(Map.empty), shapeRelatedDiffs: Seq[ShapeRelatedDiff] = Seq.empty): FlatShapeResult = {
    ExampleProjection.fromJson(example, hash, trailTags, shapeRelatedDiffs)
  }

  private val apiSetupCache = new CachedProjection(SetupStateProjection, events)
  def setupState(): SetupState = {
    apiSetupCache.withEvents(events)
  }

}
