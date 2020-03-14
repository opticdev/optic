package com.useoptic


import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExportAll, JSExportTopLevel}
import io.circe.generic.auto._
import io.circe.syntax._
import io.circe.scalajs.convertJsonToJs

import scala.scalajs.js.UndefOr

@JSExportTopLevel("ScalaJSHelpers")
@JSExportAll
object ScalaJSHelpers {

  import js.JSConverters._

  def toJsArray[A](seq: Seq[A]): js.Array[A] = {
    seq.toJSArray
  }

  def getOrUndefined[A](option: Option[A]): UndefOr[A] = {
    option.orUndefined
  }
}
