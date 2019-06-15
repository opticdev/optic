package com.seamless.ddd

import com.seamless.contexts.data_types.Commands.DataTypesCommand
import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.contexts.rfc.RfcState
import scala.scalajs.js

import scala.scalajs.js.annotation.{JSExport, JSExportAll, JSExportDescendentClasses}

@JSExportDescendentClasses
@JSExportAll
trait EventSourcedService[Command, State] {
  def handleCommand(id: AggregateId, command: Command): Unit
  def handleCommands(id: AggregateId, commands: Command*): Unit = {
    commands.foreach(cmd => handleCommand(id, cmd))
  }
  def currentState(id: AggregateId): State
}
