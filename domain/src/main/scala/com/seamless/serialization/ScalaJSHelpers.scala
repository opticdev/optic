package com.seamless.serialization
import io.circe.Encoder

import scala.scalajs.js.annotation.{JSExportAll, JSExportTopLevel}
import scala.scalajs.js
import js.JSConverters._

@JSExportTopLevel("ScalaJSHelpers")
@JSExportAll
object ScalaJSHelpers {
  def toJsArray[A](seq: Seq[A]) = {
    seq.toJSArray
  }
}
