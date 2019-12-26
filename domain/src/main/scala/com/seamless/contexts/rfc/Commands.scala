package com.seamless.contexts.rfc

import com.seamless.ddd.ExportedCommand
import io.circe.Json

import scala.scalajs.js.annotation.{JSExportAll, JSExportDescendentClasses}

object Commands {

  case class AddContribution(id: String, key: String, value: String) extends ContributionCommand
  case class SetAPIName(newName: String) extends ContributionCommand

  case class SetGitState(commitId: String, branchName: String) extends VersionControlCommand

  case class MarkSetupStageComplete(step: String) extends APISetupCommand

  @JSExportDescendentClasses
  @JSExportAll
  sealed trait ContributionCommand extends RfcCommand with ExportedCommand

  @JSExportDescendentClasses
  @JSExportAll
  sealed trait VersionControlCommand extends RfcCommand with ExportedCommand

  @JSExportDescendentClasses
  @JSExportAll
  sealed trait APISetupCommand extends RfcCommand with ExportedCommand

  @JSExportDescendentClasses
  @JSExportAll
  trait RfcCommand extends ExportedCommand

}
