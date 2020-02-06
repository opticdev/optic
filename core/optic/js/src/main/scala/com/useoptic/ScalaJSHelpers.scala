package com.useoptic

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExportAll, JSExportTopLevel}

@JSExportTopLevel("ScalaJSHelpers")
@JSExportAll
object ScalaJSHelpers {
  import js.JSConverters._
  def toJsArray[A](seq: Seq[A]) = {
    seq.toJSArray
  }
}
