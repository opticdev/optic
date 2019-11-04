package com.seamless.contexts.requests.projections

import com.seamless.contexts.requests.Commands.{PathComponentId, RequestId}
import com.seamless.contexts.requests.Events.{RequestAdded, RequestRemoved}
import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.ddd.Projection

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
object PathsWithRequestsProjection extends Projection[RfcEvent, Map[RequestId, PathComponentId]] {
  override def fromEvents(events: Vector[RfcEvent]): Map[RequestId, PathComponentId] = {
    withMap(Map.empty, events)
  }

  override def withInitialState(initialState: Map[RequestId, PathComponentId], events: Vector[RfcEvent]): Map[RequestId, PathComponentId] = {
    withMap(initialState, events)
  }

  def withMap(pathsByRequestId: Map[RequestId, PathComponentId], events: Vector[RfcEvent]): Map[RequestId, PathComponentId] = {
    //@TODO handle PathRemoved etc.?...for now, let the ui deal with it
    events.foldLeft(pathsByRequestId)((acc, event) => {
      event match {
        case e: RequestAdded => {
          acc + (e.requestId -> e.pathId)
        }
        case e: RequestRemoved => {
          acc - e.requestId
        }
        case _ => acc
      }
    })
  }
}
