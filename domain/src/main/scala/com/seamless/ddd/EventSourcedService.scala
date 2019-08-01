package com.seamless.ddd

import scala.scalajs.js.annotation.{JSExportAll, JSExportDescendentClasses}

@JSExportDescendentClasses
@JSExportAll
trait EventSourcedService[Command, State] {
  def handleCommand(id: AggregateId, command: Command): Unit
  def handleCommands(id: AggregateId, commands: Command*): Unit = {
    commands.foreach(cmd => handleCommand(id, cmd))
  }
  def currentState(id: AggregateId): State
}
