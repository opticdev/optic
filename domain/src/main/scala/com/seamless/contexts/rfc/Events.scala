package com.seamless.contexts.rfc

import java.time.Instant
import java.time.format.DateTimeFormatter

import com.seamless.contexts.base.BaseCommandContext

//@TODO: add envelope to each event (includes which command/transaction they are from and which agent caused it at what time, etc.
object Events {
  case class ContributionAdded(id: String, key: String, value: String, eventContext: Option[EventContext] = None) extends ContributionEvent
  case class APINamed(name: String, eventContext: Option[EventContext] = None) extends ContributionEvent

  sealed trait ContributionEvent extends RfcEvent

  case class GitStateSet(branchName: String, commitId: String, eventContext: Option[EventContext] = None) extends VersionControlEvent

  sealed trait VersionControlEvent extends RfcEvent

  case class EventContext(clientId: String, clientSessionId: String, clientCommandBatchId: String, createdAt: String)

  def fromCommandContext(commandContext: BaseCommandContext) = {
      EventContext(
        clientId = commandContext.clientId,
        clientSessionId = commandContext.clientSessionId,
        clientCommandBatchId = commandContext.clientCommandBatchId,
        createdAt = DateTimeFormatter.ISO_INSTANT.format(Instant.now())
      )
  }

  trait RfcEvent extends BaseEvent

  trait BaseEvent {
    def eventContext: Option[EventContext]
  }
}
