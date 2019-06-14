package com.seamless.contexts.rfc

import com.seamless.contexts.requests.projections.{Path, PathListProjection}
import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.ddd.{AggregateId, EventStore}
import scala.scalajs.js

import scala.scalajs.js.annotation.{JSExportAll, JSExportTopLevel}

@JSExportTopLevel("com.seamless.contexts.rfc.Queries")
@JSExportAll
class QueriesFacade(eventStore: EventStore[RfcEvent]) {
  private val q = new Queries(eventStore)

  def paths(aggregateId: AggregateId): js.Array[Path] = {
    import js.JSConverters._
    q.paths(aggregateId).toJSArray
  }
}

class Queries(eventStore: EventStore[RfcEvent]) {
  def paths(aggregateId: AggregateId): Vector[Path] = {
    val events = eventStore.listEvents(aggregateId)
    PathListProjection.fromEvents(events)
  }
}