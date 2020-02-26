package com.useoptic

import com.useoptic.types.capture.HttpInteraction
import io.circe.Json

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExport, JSExportAll}
import scala.util.{Failure, Success, Try}
import io.circe.scalajs.{convertJsToJson, convertJsonToJs}
import io.circe.generic.auto._
import io.circe.syntax._

import scala.scalajs.js.UndefOr
@JSExport
@JSExportAll
object JsonHelper {

  import js.JSConverters._

  def fromString(s: String): Json = {
    import io.circe.parser._
    Try {
      parse(s).right.get
    } match {
      case Failure(exception) => {
        println(exception)
        Json.Null
      }
      case Success(value) => value
    }
  }

  def toSome(x: Json): Option[Json] = Some(x)

  def toJs(x: Json): js.Any = convertJsonToJs(x)

  def toJs(x: Some[Json]): UndefOr[js.Any] = x.map(convertJsonToJs).orUndefined

  def toNone(): Option[Json] = None

  //def fromAny(any: js.Any): Json = any.asJson

  def seqToJsArray(x: Seq[Any]): js.Array[Any] = {
    x.toJSArray
  }

  def iteratorToJsIterator(x: Iterator[AnyVal]): js.Iterator[AnyVal] = {
    x.toJSIterator
  }

  def jsArrayToSeq(x: js.Array[AnyVal]): Seq[AnyVal] = {
    x.toSeq
  }

  def fromInteraction(x: js.Any): HttpInteraction = {
    import io.circe.generic.auto._
    import io.circe.scalajs.convertJsToJson
    convertJsToJson(x).right.get.as[HttpInteraction].right.get
  }
}
