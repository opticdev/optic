package com.seamless.contexts.rfc

import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.ddd.{AggregateId, ExportedCommand}


//@TODO: add envelope to each event (includes which command/transaction they are from and which agent caused it at what time, etc.
object Events {
  case class ContributionAdded(id: String, key: String, value: String) extends ContributionEvent
  sealed trait ContributionEvent extends RfcEvent

  trait RfcEvent
}
