package com.useoptic.diff.query

import com.useoptic.contexts.requests.Commands.RequestId
import com.useoptic.contexts.requests._
import com.useoptic.contexts.shapes.ShapesState
import com.useoptic.diff.RequestDiffer.{RequestDiffResult, UnmatchedQueryParameterShape}
import com.useoptic.diff.{ShapeDiffer, ShapeLike}
import io.circe.scalajs.convertJsToJson
import io.circe.Json

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExport, JSExportAll, JSExportTopLevel}

trait QueryStringParser {
  def parse(url: String): Json
}

@JSExportTopLevel("JsQueryStringParser")
@JSExportAll
class JsQueryStringParser(handler: js.Function1[String, js.Object]) extends QueryStringParser {
  def parse(url: String): Json = {
    convertJsToJson(handler(url)).right.get
  }
}


class JvmQueryStringParser(response: Json) extends QueryStringParser {
  override def parse(url: String): Json = {
    response
  }
}

sealed trait QueryStringDiffResult
case class UnsetQueryParameter(requestId: RequestId)

@JSExport
@JSExportAll
class QueryStringDiffer(shapesState: ShapesState, parser: QueryStringParser) {

  def diff(expected: HttpRequestParameter, actual: String): Iterator[RequestDiffResult] = {

    val json = parser.parse(actual)

    if (!json.isObject) {
      throw new Error("Expected the result of parse(url) to be an object")
    }

    expected.requestParameterDescriptor.shapeDescriptor match {
      case c: Commands.UnsetRequestParameterShapeDescriptor => {
        println("this should not be happening")
        Iterator.empty
      }
      case c: Commands.ShapedRequestParameterShapeDescriptor => {
        val expectedShape = shapesState.shapes(c.shapeId)
        val shapeDiff = ShapeDiffer.diff(expectedShape, ShapeLike.fromActualJson(Some(json)))(shapesState)
        println(shapeDiff.hasNext)
        val diff = shapeDiff.map(d => UnmatchedQueryParameterShape(expected.requestParameterDescriptor.requestId, expected.parameterId, d, json))
        println(diff.hasNext)
        diff
      }
    }
  }


}
