package com.useoptic.end_to_end.snapshot_task

import com.useoptic.contexts.rfc.Commands.RfcCommand
import com.useoptic.contexts.rfc.Events.RfcEvent
import com.useoptic.contexts.rfc.{RfcCommandContext, RfcService, RfcServiceJSFacade}
import com.useoptic.diff.InteractiveDiffInterpretation
import com.useoptic.diff.helpers.DiffHelpers
import com.useoptic.diff.interactions.{InteractionDiffResult, ShapeRelatedDiff, UnmatchedRequestBodyContentType, UnmatchedRequestBodyShape, UnmatchedRequestMethod, UnmatchedRequestUrl, UnmatchedResponseBodyContentType, UnmatchedResponseBodyShape, UnmatchedResponseStatusCode}
import com.useoptic.diff.interactions.interpretations.BasicInterpretations
import com.useoptic.diff.interactions.interpreters.{DefaultInterpreters, DiffDescription, DiffDescriptionInterpreters}
import com.useoptic.diff.shapes.resolvers.ShapesResolvers
import com.useoptic.dsa.OpticIds
import com.useoptic.end_to_end.snapshot_task.EndEndDiffTask.{DiffOutput, DiffWithDescriptionAndUX, Input, SuggestionSlim}
import com.useoptic.serialization.{CommandSerialization, EventSerialization, InteractionSerialization}
import com.useoptic.types.capture.{HttpInteraction, JsonLikeFrom}
import com.useoptic.ux.{DiffPreviewer, SideBySideRenderHelper}
import io.circe.Json
import io.circe._
import io.circe.generic.auto._
import io.circe.syntax._
import com.useoptic.dsa.OpticDomainIds


object EndEndDiffTask {
  case class Input(events: Vector[RfcEvent], interpretations: Vector[HttpInteraction], ids: OpticDomainIds = OpticIds.newPrefixedDeterministicIdGenerator("testing"))

  case class SuggestionSlim(title: String, commandsJson: Json)
  case class DiffWithDescriptionAndUX(diff: InteractionDiffResult, title: String, suggestions: Vector[SuggestionSlim], preview: Option[Json])
  case class DiffOutput(diffs: Vector[DiffWithDescriptionAndUX])
}

class EndEndDiffTask
  extends SnapShotDriverFixture[EndEndDiffTask.Input, EndEndDiffTask.DiffOutput]("events-interactions-diff-interpretation-ui-render", "Diff End to End") {

  override def serializeOutput(output: EndEndDiffTask.DiffOutput): Json = output.asJson
  override def deserializeInput(json: Json): EndEndDiffTask.Input = {
    val events = json.asObject.get("events").get
    EventSerialization.fromJson(events)
    val interpretations = json.asObject.get("interpretations").get.asArray.get.map(InteractionSerialization.fromJson)

    Input(EventSerialization.fromJson(events).get, interpretations)
  }
  override def serializeInput(input: EndEndDiffTask.Input): Json = {
    JsonObject.fromMap(Map("events" -> EventSerialization.toJson(input.events), "interpretations" -> input.interpretations.asJson)).asJson
  }
  override def deserializeOutput(json: Json): EndEndDiffTask.DiffOutput = json.as[EndEndDiffTask.DiffOutput].right.get

  override def summary(input: Input, result: DiffOutput): String = {
    (result.diffs.map(i => {
      s"${i.title} || suggestions: ${i.suggestions.map(_.title).toString}"
    })).mkString("\n")
  }

  override def transform(input: EndEndDiffTask.Input): EndEndDiffTask.DiffOutput = {
    implicit val ids = input.ids
    val eventStore = RfcServiceJSFacade.makeEventStore()
    val rfcId = "testRfcId"
    eventStore.append(rfcId, input.events)
    val rfcService = new RfcService(eventStore)
    val rfcState = rfcService.currentState(rfcId)

    val shapesResolvers = ShapesResolvers.newResolver(rfcState)

    val diffs = DiffHelpers.groupByDiffs(shapesResolvers, rfcState, input.interpretations).toVector.sortBy(_.toString)

    DiffOutput(diffs.map(i => {
      val (diff, interactions) = i

      val interpret = new DiffDescriptionInterpreters(rfcState)
      val description = interpret.interpret(diff, interactions.head)

      val previewer = new DiffPreviewer(rfcState)

      val preview = diff match {
        case diff: ShapeRelatedDiff => diff match {
          case UnmatchedRequestBodyShape(interactionTrail, requestsTrail, shapeDiffResult) => {
            previewer.previewDiff(interactions.head.request.body.jsonOption.flatMap(JsonLikeFrom.json), Some(shapeDiffResult.shapeTrail.rootShapeId), Set(shapeDiffResult), Set.empty)
          }
          case UnmatchedResponseBodyShape(interactionTrail, requestsTrail, shapeDiffResult) => {
            previewer.previewDiff(interactions.head.response.body.jsonOption.flatMap(JsonLikeFrom.json), Some(shapeDiffResult.shapeTrail.rootShapeId), Set(shapeDiffResult), Set.empty)
          }
        }
        case _ => None
      }

      val basicInterpreter = new DefaultInterpreters(shapesResolvers, rfcState)
      val suggestions = basicInterpreter.interpret(diff, interactions.head).map(i => {
        SuggestionSlim(i.action, CommandSerialization.toJson(i.commands))
      })

      DiffWithDescriptionAndUX(diff, description.title, suggestions.toVector, preview.map(_.toJson))
    }))
  }
}
