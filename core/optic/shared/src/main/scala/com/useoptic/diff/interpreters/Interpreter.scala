package com.useoptic.diff.interpreters

import com.useoptic.diff.InteractiveDiffInterpretation
import com.useoptic.types.capture.HttpInteraction

import scala.scalajs.js.annotation.{JSExportAll, JSExportDescendentClasses}


trait InteractiveDiffInterpreter[T] {
  def interpret(diff: T, interaction: HttpInteraction): Seq[InteractiveDiffInterpretation]
}
