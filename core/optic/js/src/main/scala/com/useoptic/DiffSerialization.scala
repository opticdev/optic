package com.useoptic

import com.useoptic.diff.helpers.DiffHelpers.InteractionsGroupedByDiff
import io.circe.{Encoder, Json}
import io.circe.scalajs.convertJsonToJs
import io.circe.syntax._
import io.circe.generic.auto._

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