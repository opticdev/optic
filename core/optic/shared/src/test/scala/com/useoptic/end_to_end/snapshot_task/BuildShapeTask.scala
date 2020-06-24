package com.useoptic.end_to_end.snapshot_task

import com.useoptic.contexts.rfc.Events.RfcEvent
import com.useoptic.contexts.shapes.Commands.ShapeId
import com.useoptic.diff.MutableCommandStream
import com.useoptic.diff.initial.{DistributionAwareShapeBuilder, ShapesToMake}
import com.useoptic.diff.interactions.InteractionDiffResult
import com.useoptic.dsa.OpticIds
import com.useoptic.serialization.CommandSerialization
import com.useoptic.types.capture.{HttpInteraction, JsonLikeFrom}
import io.circe.Json
import io.circe._
import io.circe.generic.auto._
import io.circe.syntax._


object BuildShapeTask {
  case class Input(inputJsons: Vector[Json])
  case class Output(shape: String, commandsJson: Json)
}

class BuildShapeTask
  extends SnapShotDriverFixture[BuildShapeTask.Input, BuildShapeTask.Output]("json-to-shapes", "Json to Shape") {
  override def serializeOutput(output: BuildShapeTask.Output): Json = output.asJson

  override def deserializeInput(json: Json): BuildShapeTask.Input = json.as[BuildShapeTask.Input].right.get

  override def serializeInput(input: BuildShapeTask.Input): Json = input.asJson

  override def deserializeOutput(json: Json): BuildShapeTask.Output = json.as[BuildShapeTask.Output].right.get

  override def summary(input: BuildShapeTask.Input, result: BuildShapeTask.Output): String = {
    input.inputJsons.map(_.noSpaces).mkString("\n") + "\n\n" + result.shape
  }

  override def transform(input: BuildShapeTask.Input): BuildShapeTask.Output = {
    implicit val ids = OpticIds.newDeterministicIdGenerator
    val shape = DistributionAwareShapeBuilder.aggregateTrailsAndValues(input.inputJsons.flatMap(JsonLikeFrom.json)).getRoot.toShape

    implicit val commands = new MutableCommandStream
    DistributionAwareShapeBuilder.buildCommandsFor(shape, None)
    BuildShapeTask.Output(shape.toString, CommandSerialization.toJson(commands.toImmutable.flatten))
  }
}
