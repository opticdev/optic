package com.useoptic.diff.query

import io.circe.scalajs.convertJsToJson
import io.circe.Json

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExportAll, JSExportTopLevel}


@JSExportTopLevel("JsQueryStringParser")
@JSExportAll
class JsQueryStringParser(handler: js.Function1[String, js.Object]) extends QueryStringParser {
  def parse(url: String): Json = {
    convertJsToJson(handler(url)).right.get
  }
}
