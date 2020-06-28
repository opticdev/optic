package com.useoptic

import com.useoptic.UrlCounterDeserializer.fromJson
import com.useoptic.diff.helpers.UndocumentedUrlHelpers.{MethodAndPath, UrlCounter}
import com.useoptic.ux.{NewEndpoint}
import io.circe.{Decoder, Encoder, Json}
import io.circe.scalajs.{convertJsToJson, convertJsonToJs}
import io.circe.syntax._
import io.circe.generic.auto._

import scala.collection.immutable
import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExport, JSExportAll, JSExportTopLevel}


@JSExportTopLevel("UrlCounterJsonSerializer")
@JSExportAll
object UrlCounterJsonSerializer {
  implicit val urlCountsEncoder: Encoder[UrlCounter] = x => {
    x.counts.toVector.asJson
  }

  def toJson(report: UrlCounter): Json = {
    report.asJson
  }

  def toJs(report: UrlCounter): js.Any = {
    convertJsonToJs(report.asJson)
  }

  def toFriendlyJs(report: UrlCounter): js.Any = {
    convertJsonToJs(
      report.counts.map(entry => {
        val (k, v) = entry
        Json.fromFields(Seq(
          "method" -> k.method.asJson,
          "path" -> k.path.asJson,
          "count" -> v.asJson
        ))
      }).asJson
    )
  }
}

@JSExportTopLevel("UrlCounterJsonDeserializer")
@JSExportAll
object UrlCounterDeserializer {

  implicit val urlCountsDecoder: Decoder[UrlCounter] = x => {
    val counts = scala.collection.mutable.Map[MethodAndPath, Int](x.as[Seq[(MethodAndPath, Int)]].right.get: _*)
    val counter = new UrlCounter
    counter.counts = counts
    Right(counter)
  }

  def fromJson(x: Json): UrlCounter = {
    x.as[UrlCounter].right.get
  }

  def fromJs(x: js.Any) = {
    fromJson(convertJsToJson(x).right.get)
  }


}

@JSExport
@JSExportAll
object UrlCounterHelper {
  import UrlCounterDeserializer._
  def fromJsonToSeq(jsJson: js.Any): js.Array[NewEndpoint] = {
    js.Array.apply(
      convertJsToJson(jsJson).right.get.as[Seq[NewEndpoint]].right.get:_*
    )
  }
}
