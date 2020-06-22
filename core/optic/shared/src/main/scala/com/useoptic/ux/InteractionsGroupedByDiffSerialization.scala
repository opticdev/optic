package com.useoptic.ux

import com.useoptic.diff.helpers.DiffHelpers.InteractionsGroupedByDiff
import com.useoptic.diff.interactions.InteractionDiffResult
import com.useoptic.types.capture.HttpInteraction
import io.circe.Json
import io.circe._
import io.circe.generic.auto._
import io.circe.syntax._

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
object InteractionsGroupedByDiffSerialization {
  case class InteractionsGroupedByDiffJson(diff: InteractionDiffResult, interactionPointers: Seq[String])
  def toJson(interactionsGroupedByDiff: InteractionsGroupedByDiff, toPointer: HttpInteraction => String): Json = {
    val allDiffs = interactionsGroupedByDiff.map {
      case (diff, interactions) => InteractionsGroupedByDiffJson(diff, interactions.map(toPointer)).asJson
    }
    Json.fromValues(allDiffs)
  }
}
