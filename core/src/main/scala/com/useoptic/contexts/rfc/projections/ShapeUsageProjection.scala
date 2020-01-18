package com.useoptic.contexts.rfc.projections

import com.useoptic.contexts.requests.Commands.RequestId
import com.useoptic.contexts.requests.Events.{RequestBodySet, RequestBodyUnset, ResponseBodySet, ResponseBodyUnset}
import com.useoptic.contexts.rfc.Events.RfcEvent
import com.useoptic.contexts.shapes.Commands.ShapeId
import com.useoptic.contexts.shapes.Events.BaseShapeSet
import com.useoptic.ddd.Projection


object ShapeUsageProjection extends Projection[RfcEvent, Map[ShapeId, Set[RequestId]]] {
  type ShapeUsages = Map[ShapeId, Set[RequestId]]

  override def fromEvents(events: Vector[RfcEvent]): ShapeUsages = ???

  override def withInitialState(initialState: ShapeUsages, events: Vector[RfcEvent]): ShapeUsages = ???

  def helper(usages: ShapeUsages, events: Vector[RfcEvent]): ShapeUsages = {
    val children: Map[ShapeId, Set[ShapeId]] = Map.empty
    val parents: Map[ShapeId, ShapeId] = Map.empty
    events.foreach {
      case e: RequestBodySet => {

      }
      case e: RequestBodyUnset => {

      }
      case e: ResponseBodySet => {

      }
      case e: ResponseBodyUnset => {

      }
    }
    null
  }
}
