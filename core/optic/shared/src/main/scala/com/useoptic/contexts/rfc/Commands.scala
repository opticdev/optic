package com.useoptic.contexts.rfc

import com.useoptic.ddd.ExportedCommand

import scala.scalajs.js.annotation.{JSExportAll, JSExportDescendentClasses}

object Commands {

  case class AddContribution(id: String, key: String, value: String) extends ContributionCommand

  case class SetAPIName(newName: String) extends ContributionCommand

  case class SetGitState(commitId: String, branchName: String) extends VersionControlCommand

  case class MarkSetupStageComplete(step: String) extends APISetupCommand

  case class StartBatchCommit(batchId: String, commitMessage: String) extends SpecEvolutionCommand

  case class EndBatchCommit(batchId: String) extends SpecEvolutionCommand

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
  sealed trait SpecEvolutionCommand extends RfcCommand with ExportedCommand

  @JSExportDescendentClasses
  @JSExportAll
  trait RfcCommand extends ExportedCommand


}
