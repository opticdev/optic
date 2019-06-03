package com.seamless.contexts.rfc

import com.seamless.ddd.AggregateId


//@TODO: add envelope to each event (includes which command/transaction they are from and which agent caused it at what time, etc.
object Events {
  case class RfcStarted(rfcId: AggregateId, goal: String)
  trait RfcEvent
}
