package com.seamless.contexts.rfc

import com.seamless.ddd.{AggregateId, ExportedCommand}

import scala.scalajs.js.annotation.{JSExportAll, JSExportDescendentClasses}

object Commands {
  case class StartRfc(rfcId: AggregateId, goal: String)

  @JSExportDescendentClasses
  @JSExportAll
  trait RfcCommand extends ExportedCommand
}
