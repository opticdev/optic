package com.useoptic.end_to_end.snapshot_task

import com.useoptic.contexts.requests.Commands.{AddPathComponent, AddPathParameter}
import com.useoptic.contexts.rfc.Commands.RfcCommand
import com.useoptic.contexts.rfc.Events.RfcEvent
import com.useoptic.contexts.rfc.{RfcCommandContext, RfcService, RfcServiceJSFacade, RfcState}
import com.useoptic.diff.helpers.DiffHelpers
import com.useoptic.diff.interactions.interpreters.DefaultInterpreters
import com.useoptic.diff.interactions.{UnmatchedRequestBodyContentType, UnmatchedResponseBodyContentType, UnmatchedResponseBodyShape}
import com.useoptic.diff.shapes.resolvers.{DefaultShapesResolvers, ShapesResolvers}
import com.useoptic.dsa.{OpticDomainIds, SequentialIdGenerator}
import com.useoptic.types.capture.HttpInteraction

class TestDataHelper(id: String) {

  def addPath(components: String*)(implicit ids: OpticDomainIds): Vector[RfcCommand] = {

    var lastPathId = "root"

    val commands: Seq[RfcCommand] = components.map {
      case parameter if parameter.charAt(0) == ':' => {
        val id = ids.newPathId
        val command = AddPathParameter(id, lastPathId, parameter)
        lastPathId = id
        command
      }
      case constant => {
        val id = ids.newPathId
        val command = AddPathComponent(id, lastPathId, constant)
        lastPathId = id
        command
      }
    }
    Vector.apply(commands: _*)

  }

  def learnBaseline(path: Vector[String], interactions: Vector[HttpInteraction])(implicit ids: OpticDomainIds): Vector[RfcCommand] = {

    val pathCommands = addPath(path:_*)
    val (events, spec) = commandsToEventsAndState(pathCommands)

    val resolvers: ShapesResolvers = new DefaultShapesResolvers(spec)
    val diff = DiffHelpers.groupByDiffs(resolvers, spec, interactions)
    val basicInterpreter = new DefaultInterpreters(resolvers, spec)
    val newBodyCommands = diff.toVector.collect {
      case (diff: UnmatchedRequestBodyContentType, interactions) => basicInterpreter.interpret(diff, interactions.toVector).head.commands
      case (diff: UnmatchedResponseBodyContentType, interactions) => basicInterpreter.interpret(diff, interactions.toVector).head.commands
    }

    pathCommands ++ newBodyCommands.flatten
  }

  def learnBaselineEvents(path: Vector[String], interactions: Vector[HttpInteraction])(implicit ids: OpticDomainIds) =
    finalizeEvents(learnBaseline(path, interactions))

  def finalizeEvents(commands: Vector[RfcCommand])(implicit ids: OpticDomainIds): (Vector[RfcEvent], RfcState) = {
    commandsToEventsAndState(commands.toVector)
  }


  private def commandsToEventsAndState(commands: Vector[RfcCommand])(implicit ids: OpticDomainIds): (Vector[RfcEvent], RfcState) = {
    val rfcId: String = "rfc-1"
    val eventStore = RfcServiceJSFacade.makeEventStore()
    val rfcService: RfcService = new RfcService(eventStore)
    rfcService.handleCommands(rfcId, RfcCommandContext("ccc", "sss", "bbb"), commands: _*)

    (eventStore.listEvents(rfcId), rfcService.currentState(rfcId))
  }

}
