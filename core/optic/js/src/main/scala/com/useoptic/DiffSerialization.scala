package com.useoptic

import com.useoptic.diff.helpers.DiffHelpers.{InteractionPointersGroupedByDiff, InteractionsGroupedByDiff}
import com.useoptic.diff.interactions.InteractionDiffResult

import io.circe.{Decoder, Encoder, Json}
import io.circe.scalajs.{convertJsToJson, convertJsonToJs}
import io.circe.generic.auto._
import io.circe.syntax._

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExportAll, JSExportTopLevel}


@JSExportTopLevel("DiffJsonSerializer")
@JSExportAll
object DiffJsonSerializer {
  implicit val diffResultEncoder: Encoder[InteractionsGroupedByDiff] = x => {
    x.toVector.asJson
  }

  def toJson(interactionsGroupedByDiff: InteractionsGroupedByDiff): Json = {
    interactionsGroupedByDiff.asJson
  }

  def toJs(interactionsGroupedByDiff: InteractionsGroupedByDiff): js.Any = {
    convertJsonToJs(interactionsGroupedByDiff.asJson)
  }
}

@JSExportTopLevel("DiffWithPointersJsonSerializer")
@JSExportAll
object DiffWithPointersJsonSerializer {
  implicit val diffResultEncoder: Encoder[InteractionPointersGroupedByDiff] = x => {
    x.toVector.asJson
  }

  def toJson(interactionsGroupedByDiff: InteractionPointersGroupedByDiff): Json = {
    interactionsGroupedByDiff.asJson
  }

  def toJs(interactionsGroupedByDiff: InteractionPointersGroupedByDiff): js.Any = {
    convertJsonToJs(interactionsGroupedByDiff.asJson)
  }
}
@JSExportTopLevel("DiffWithPointersJsonDeserializer")
@JSExportAll
object DiffWithPointersJsonDeserializer {
  implicit val diffResultDecoder: Decoder[InteractionPointersGroupedByDiff] = x => {
    Right(x.as[Seq[(InteractionDiffResult, Seq[String])]].right.get.toMap)
  }

  def fromJs(x: js.Any) = {
    fromJson(convertJsToJson(x).right.get)
  }

  def fromJson(x: Json): InteractionPointersGroupedByDiff = {
    x.as[InteractionPointersGroupedByDiff].right.get
  }
}