package com.seamless.oas.export

import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.contexts.rfc.{InMemoryQueries, RfcService}
import com.seamless.ddd.InMemoryEventStore
import io.circe.Json

import scala.scalajs.js.annotation.JSExportAll
import scala.util.{Failure, Success, Try}

@JSExportAll
case class OASExportResult(json: Option[Json], error: Option[String])

@JSExportAll
object OASExportJsFacade {
  def exportOASFromEvents(eventStreamString: String) = {
    Try {
      val eventStore = new InMemoryEventStore[RfcEvent]()
      eventStore.bulkAdd("id", eventStreamString)
      val service = new RfcService(eventStore)
      val queries = new InMemoryQueries(eventStore, service, "id")

      val exporter = new OASExport(queries, service)
      exporter.fullOASDescription
    } match {
      case Success(json) => OASExportResult(Some(json), None)
      case Failure(t) => OASExportResult(None, Some(t.getMessage))
    }
  }
}
