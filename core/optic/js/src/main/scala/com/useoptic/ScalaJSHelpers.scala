package com.useoptic

import com.useoptic.diff.{DiffInterpretation, DynamicDescription, FrontEndMetadata, InterpretationContext}
import com.useoptic.diff.RequestDiffer.RequestDiffResult
import com.useoptic.diff.ShapeDiffer.ShapeDiffResult

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

  def asJs(x: RequestDiffResult) = {
    convertJsonToJs(x.asJson)
  }

  def asJs(x: ShapeDiffResult) = {
    convertJsonToJs(x.asJson)
  }

  def asJs(x: DynamicDescription) = {
    convertJsonToJs(x.asJson)
  }

  def asJs(x: InterpretationContext) = {
    convertJsonToJs(x.asJson)
  }

  def asJs(x: FrontEndMetadata) = {
    convertJsonToJs(x.asJson)
  }
}
