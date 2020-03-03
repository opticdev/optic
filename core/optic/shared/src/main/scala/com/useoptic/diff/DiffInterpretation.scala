package com.useoptic.diff

import com.useoptic.contexts.rfc.Commands.RfcCommand
import com.useoptic.diff.ChangeType.ChangeType

import scala.scalajs.js.annotation.JSExportAll

@JSExportAll
case class InteractiveDiffInterpretation(title: String, description: String, commands: Seq[RfcCommand], changeType: ChangeType) {
  def changeTypeAsString: String = changeType.toString
}

object ChangeType extends Enumeration {
  type ChangeType = Value
  val Addition, Removal, Update = Value
}
