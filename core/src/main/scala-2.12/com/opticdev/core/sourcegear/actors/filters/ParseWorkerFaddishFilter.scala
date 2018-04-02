package com.opticdev.core.sourcegear.actors.filters

import akka.dispatch.Envelope
import com.opticdev.core.sourcegear.actors.ParserRequest
import com.opticdev.scala.akka.FaddishMailboxFilter

class ParseWorkerFaddishFilter extends FaddishMailboxFilter {
  override def filterOut(target: Envelope) : PartialFunction[Any, Boolean] = {
    target.message match {
      case pR: ParserRequest =>
        val pathAsString = pR.file.pathAsString
        PartialFunction[Any, Boolean] {
          case otherPr: ParserRequest => otherPr.file.pathAsString == pathAsString
          case _ => false
        }
      case _ =>
        super.filterOut(target)
    }
  }
}