package com.seamless.contexts.rfc

import com.seamless.ddd.{AggregateId, ExportedCommand}

import scala.scalajs.js.annotation.{JSExportAll, JSExportDescendentClasses}

object Commands {

  case class AddContribution(id: String, key: String, value: String) extends ContributionCommand

  @JSExportDescendentClasses
  @JSExportAll
  sealed trait ContributionCommand extends RfcCommand with ExportedCommand

  @JSExportDescendentClasses
  @JSExportAll
  trait RfcCommand extends ExportedCommand
}
