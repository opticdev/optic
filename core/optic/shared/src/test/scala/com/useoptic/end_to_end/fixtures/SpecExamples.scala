package com.useoptic.end_to_end.fixtures

import com.useoptic.contexts.requests.Commands.{AddRequest, AddResponse}
import com.useoptic.contexts.rfc.Commands.RfcCommand
import com.useoptic.contexts.rfc.Events.RfcEvent
import com.useoptic.contexts.rfc.{RfcCommandContext, RfcService, RfcServiceJSFacade, RfcState}
import com.useoptic.ddd.EventStore
import com.useoptic.diff.interpreters.BasicDiffInterpreter
import com.useoptic.diff.query.{JvmQueryStringParser, QueryStringDiffer}
import com.useoptic.diff._
import io.circe.Json

object SpecExamples {


  lazy val getRoot = commandsFixture(Seq(
    AddRequest("req1", "root", "GET"),
    AddResponse("res1", "req1", 200)
  ))


  private

  val commandContext: RfcCommandContext = RfcCommandContext("a", "b", "c")
  case class DiffAndInterpretation(result: RequestDiffer.RequestDiffResult, interpretation: DiffInterpretation)

  case class DiffSessionFixture(eventStore: EventStore[RfcEvent], rfcId: String, rfcService: RfcService) {
    def execute(commands: Seq[RfcCommand]): RfcState = {
      rfcService.handleCommandSequence(rfcId, commands, commandContext)
      rfcService.currentState(rfcId)
    }

    def getDiffs(interaction: ApiInteraction, pluginRegistry: Option[PluginRegistry] = None) = {
      val rfcState = rfcService.currentState(rfcId)
      val plugins = pluginRegistry match {
        case None => PluginRegistryUtilities.defaultPluginRegistry(rfcState.shapesState)
        case Some(r) => r
      }
      val diffs = RequestDiffer.compare(interaction, rfcState, plugins)
      val interpreter = new BasicDiffInterpreter(rfcState.shapesState)
      (diffs, interpreter)
    }

    def getDiff(interaction: ApiInteraction) = {
      val (diffs, interpreter) = getDiffs(interaction)

      val diff = diffs.next()
      val interpretation = interpreter.interpret(diff)
      //      println(diff)
      //      println(interpretation)
      DiffAndInterpretation(diff, if (interpretation.isEmpty) null else interpretation.head)
    }

    def getDiffWithQueryStringParser(interaction: ApiInteraction, parsedQueryString: Json) = {
      val rfcState = rfcService.currentState(rfcId)
      val parser = new JvmQueryStringParser(parsedQueryString)
      val differ = new QueryStringDiffer(rfcState.shapesState, parser)
      val plugins = PluginRegistry(differ)
      val diffs = RequestDiffer.compare(interaction, rfcState, plugins)
      val interpreter = new BasicDiffInterpreter(rfcState.shapesState)
      (diffs, interpreter)
    }

    def events() = {
      println(eventStore.listEvents(rfcId))
    }
  }
  def commandsFixture(initialCommands: Seq[RfcCommand]) = {
    val rfcId: String = "rfc-1"
    val eventStore = RfcServiceJSFacade.makeEventStore()
    val rfcService: RfcService = new RfcService(eventStore)
    rfcService.handleCommands(rfcId, RfcCommandContext("ccc", "sss", "bbb"), initialCommands: _*)
    DiffSessionFixture(eventStore, rfcId, rfcService)
  }

}
