package com.useoptic

import com.useoptic.contexts.requests.Commands.{AddPathComponent, AddPathParameter}
import com.useoptic.contexts.requests.{Commands, RequestsServiceHelper}
import com.useoptic.contexts.rfc.Commands.RfcCommand
import com.useoptic.contexts.rfc.Events.RfcEvent
import com.useoptic.contexts.rfc.{RfcCommandContext, RfcService, RfcServiceJSFacade, RfcState}
import com.useoptic.diff.helpers.DiffHelpers
import com.useoptic.diff.interactions.interpreters.DefaultInterpreters
import com.useoptic.diff.interactions.{UnmatchedRequestBodyContentType, UnmatchedResponseBodyContentType, UnmatchedResponseBodyShape}
import com.useoptic.dsa.SequentialIdGenerator
import com.useoptic.serialization.EventSerialization
import com.useoptic.serialization.InteractionSerialization.shapeHashDecoder
import com.useoptic.types.capture.HttpInteraction
import io.circe.scalajs.{convertJsToJson, convertJsonToJs}

import scala.collection.immutable
import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
object TestDataHelper {
  def withPrefix(id: String) = new TestDataHelper(id)
}


@JSExportAll
class TestDataHelper(id: String) {

  private val idGenerator = new SequentialIdGenerator(id)

  def AddPath(components: js.Array[String]): js.Array[RfcCommand] = {

    var lastPathId = "root"

    val commands: Seq[RfcCommand] = components.toVector.map {
      case parameter if parameter.charAt(0) == ':' => {
        val id = idGenerator.nextId()
        val command = AddPathParameter(id, lastPathId, parameter)
        lastPathId = id
        command
      }
      case constant => {
        val id = idGenerator.nextId()
        val command = AddPathComponent(id, lastPathId, constant)
        lastPathId = id
        command
      }
    }
    js.Array.apply(commands:_*)

  }

  def LearnBaseline(commands: js.Array[RfcCommand], interactionsRAW: js.Array[js.Any]): js.Array[RfcCommand] = {

    val (events, spec) = commandsToEventsAndState(commands.toVector)

    import io.circe.generic.auto._
    import io.circe.scalajs.convertJsToJson
    import shapeHashDecoder._
    val interactions = convertJsToJson(interactionsRAW).right.get.as[Seq[HttpInteraction]].right.get

    val diff = DiffHelpers.groupByDiffs(spec, interactions.toVector)
    val basicInterpreter = new DefaultInterpreters(spec)
    val newBodyCommands = diff.toVector.collect {
      case (diff: UnmatchedRequestBodyContentType, interactions) => basicInterpreter.interpret(diff, interactions.toVector).head.commands
      case (diff: UnmatchedResponseBodyContentType, interactions) => basicInterpreter.interpret(diff, interactions.toVector).head.commands
    }

    js.Array(newBodyCommands.flatten:_*)
  }

  def FinalizeEvents(commands: js.Array[RfcCommand]): js.Any = {
    val (events, _) = commandsToEventsAndState(commands.toVector)
    val json = EventSerialization.toJson(events)
    convertJsonToJs(json)
  }


  private def commandsToEventsAndState(commands: Vector[RfcCommand]): (Vector[RfcEvent], RfcState) = {
    val rfcId: String = "rfc-1"
    val eventStore = RfcServiceJSFacade.makeEventStore()
    val rfcService: RfcService = new RfcService(eventStore)
    rfcService.handleCommands(rfcId, RfcCommandContext("ccc", "sss", "bbb"), commands:_*)

    (eventStore.listEvents(rfcId), rfcService.currentState(rfcId))
  }

}
