package com.seamless.contexts.rfc.projections

import com.seamless.contexts.requests.Commands.RequestId
import com.seamless.contexts.requests.Events.{RequestBodySet, RequestBodyUnset, ResponseBodySet, ResponseBodyUnset}
import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.contexts.shapes.Commands.ShapeId
import com.seamless.contexts.shapes.Events.BaseShapeSet
import com.seamless.ddd.Projection


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
  }
}
