package com.useoptic

import com.useoptic.contexts.rfc.ScmState.BranchName
import com.useoptic.contexts.rfc.projections.ChangelogProjection
import com.useoptic.contexts.rfc.{RfcService, RfcServiceJSFacade}
import io.circe.generic.auto._
import io.circe.syntax._

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExport, JSExportAll}
import scala.util.Try

@JSExport
@JSExportAll
object CalculateChangelogJsFacade {
  def calculateMarkdownChangelog(events: String, branchName: BranchName, lastCommitIdOptionJs: js.UndefOr[String]): ChangelogResult = {
    val lastCommitIdOption = lastCommitIdOptionJs.toOption

    val attemptChangelog = Try {
      val eventStore = RfcServiceJSFacade.makeEventStore()
      eventStore.bulkAdd("cl", events)
      val allEvents = eventStore.listEvents("cl")

      val rfcService = new RfcService(eventStore)
      val changelog = ChangelogProjection.branchChangelog(branchName, lastCommitIdOption, allEvents, rfcService.currentState("cl"))

      if (changelog.isDefined && changelog.get.changelog.nonEmpty) {
        ChangelogResult(true, None, Some(changelog.get.changelog.markdown), true)
      } else {
        ChangelogResult(true, None, None, false)
      }
    }

    if (attemptChangelog.isSuccess) {
      attemptChangelog.get
    } else {
      ChangelogResult(false, Some(attemptChangelog.failed.get.toString), None, false)
    }
  }

}

@JSExportAll
case class ChangelogResult(success: Boolean, error: Option[String], markdown: Option[String], hasChanges: Boolean) {
  def asJs = {
    import io.circe.scalajs.convertJsonToJs
    convertJsonToJs(this.asJson)
  }
}
