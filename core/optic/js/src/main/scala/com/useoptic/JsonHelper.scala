package com.useoptic

import io.circe.Json

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExport, JSExportAll}
import scala.util.{Failure, Success, Try}
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

  def toNone(): Option[Json] = None

  //def fromAny(any: js.Any): Json = any.asJson

  def seqToJsArray(x: Seq[AnyVal]): js.Array[AnyVal] = {
    x.toJSArray
  }

  def iteratorToJsIterator(x: Iterator[AnyVal]): js.Iterator[AnyVal] = {
    x.toJSIterator
  }
}
