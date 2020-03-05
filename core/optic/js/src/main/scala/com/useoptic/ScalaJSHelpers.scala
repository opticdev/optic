package com.useoptic


import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExportAll, JSExportTopLevel}
import io.circe.generic.auto._
import io.circe.syntax._
import io.circe.scalajs.convertJsonToJs

@JSExportTopLevel("ScalaJSHelpers")
@JSExportAll
object ScalaJSHelpers {

  import js.JSConverters._

  def toJsArray[A](seq: Seq[A]) = {
    seq.toJSArray
  }
}
