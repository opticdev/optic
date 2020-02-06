package com.useoptic.ddd

import scala.scalajs.js.annotation.{JSExportAll, JSExportDescendentClasses}

@JSExportDescendentClasses
@JSExportAll
trait EventSourcedService[Command, CommandContext, State] {
  def handleCommand(id: AggregateId, command: Command, context: CommandContext): Unit
  def handleCommandSequence(id: AggregateId, commands: Seq[Command], context: CommandContext): Unit = {
    commands.foreach(cmd => handleCommand(id, cmd, context))
  }
  def handleCommands(id: AggregateId, context: CommandContext, commands: Command*): Unit = {
    commands.foreach(cmd => handleCommand(id, cmd, context))
  }

  def currentState(id: AggregateId): State
}
