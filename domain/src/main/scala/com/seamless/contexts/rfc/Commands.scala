package com.seamless.contexts.rfc

import com.seamless.ddd.ExportedCommand

import scala.scalajs.js.annotation.{JSExportAll, JSExportDescendentClasses}

object Commands {

  case class AddContribution(id: String, key: String, value: String) extends ContributionCommand
  case class SetAPIName(newName: String) extends ContributionCommand

  case class AddParticipant(id: String) extends ParticipantsCommand

  case class SetGitState(commitId: String, branch: String) extends VersionControlCommand

  @JSExportDescendentClasses
  @JSExportAll
  sealed trait ContributionCommand extends RfcCommand with ExportedCommand

  @JSExportDescendentClasses
  @JSExportAll
  sealed trait ParticipantsCommand extends RfcCommand with ExportedCommand

  @JSExportDescendentClasses
  @JSExportAll
  sealed trait VersionControlCommand extends RfcCommand with ExportedCommand

  @JSExportDescendentClasses
  @JSExportAll
  trait RfcCommand extends ExportedCommand
  
}