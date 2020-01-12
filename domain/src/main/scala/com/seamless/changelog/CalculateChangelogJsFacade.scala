package com.seamless.changelog

import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.contexts.rfc.ScmState.{BranchName, CommitId}
import com.seamless.contexts.rfc.projections.ChangelogProjection
import com.seamless.contexts.rfc.{RfcService, RfcServiceJSFacade}
import com.seamless.ddd.EventStore
import io.circe._
import io.circe.generic.auto._
import io.circe.syntax._
import com.seamless.serialization.EventSerialization
import com.seamless.utilities.DocBuilder

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExport, JSExportAll}
import scala.util.{Failure, Success, Try}

@JSExport
@JSExportAll
object CalculateChangelogJsFacade {
  def calculateMarkdownChangelog(events: String, branchName: BranchName, lastCommitIdOptionJs: js.UndefOr[String]): ChangelogResult = {
    import js.JSConverters._
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
