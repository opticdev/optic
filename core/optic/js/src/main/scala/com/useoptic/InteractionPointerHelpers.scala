package com.useoptic

import com.useoptic.types.capture.HttpInteraction

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
class InteractionPointerHelpers(converter: js.Function1[HttpInteraction, String]) {
  def toPointer(interaction: HttpInteraction): String = {
    converter(interaction)
  }
}
