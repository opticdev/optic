package com.useoptic.contexts.rfc

import com.useoptic.ddd._
import com.useoptic.contexts.requests.Commands._
import com.useoptic.contexts.requests.projections._
import com.useoptic.contexts.requests._
import com.useoptic.contexts.rfc.Events.RfcEvent
import com.useoptic.contexts.rfc.projections.ContributionsProjection
import com.useoptic.contexts.shapes.Commands._
import com.useoptic.contexts.shapes.ShapesState
import com.useoptic.contexts.shapes.projections._
import com.useoptic.diff.interactions.ShapeRelatedDiff
import com.useoptic.diff.shapes._
import com.useoptic.diff.shapes.resolvers.{CachingShapesResolvers, DefaultShapesResolvers, ShapesResolvers}
import io.circe.Json


class InMemoryQueries(eventStore: EventStore[RfcEvent], service: RfcService, aggregateId: AggregateId) {

  private def events: Vector[RfcEvent] = {
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

  def resolvePath(url: String): Option[PathComponentId] = {
    Utilities.resolvePath(url, requestsState.pathComponents)
  }

  def endpoints(): Seq[AllEndpointsProjection.Endpoint] = {
    AllEndpointsProjection.fromRfcState(service.currentState(aggregateId))
  }

  val rfcState = service.currentState(aggregateId)

  val nameForShapeId = new NameForShapeId(shapesResolvers(), rfcState.shapesState)

  def nameForShapeId(shapeId: ShapeId): Seq[ColoredComponent] = {
    nameForShapeId.getShapeName(shapeId)()
  }

  def nameForFieldId(fieldId: FieldId): Seq[ColoredComponent] = {
    nameForShapeId.getFieldIdShapeName(fieldId)
  }


  def flatShapeForShapeId(shapeId: ShapeId, shapeRelatedDiffs: Seq[ShapeRelatedDiff] = Seq.empty, trailTags: TrailTags[ShapeTrail] = TrailTags(Map.empty)): FlatShapeResult = {
    nameForShapeId.flatShapeQueries.forShapeId(shapeId, None, trailTags, shapeRelatedDiffs)(revision = events.size)
  }

  def flatShapeForExample(example: Json, hash: String, trailTags: TrailTags[JsonTrail] = TrailTags(Map.empty), shapeRelatedDiffs: Seq[ShapeRelatedDiff] = Seq.empty): FlatShapeResult = {
    ExampleProjection.fromJson(example, hash, trailTags, shapeRelatedDiffs)
  }

  def shapesResolvers(): ShapesResolvers = new CachingShapesResolvers(new DefaultShapesResolvers(rfcState))

}
