package com.useoptic.diff.interpreters

import com.useoptic.diff.{DiffInterpretation, InteractiveDiffInterpretation}
import com.useoptic.types.capture.HttpInteraction

import scala.scalajs.js.annotation.{JSExportAll, JSExportDescendentClasses}

@JSExportAll
@JSExportDescendentClasses
trait Interpreter[T] {
  def interpret(diff: T): Seq[DiffInterpretation]
}

trait InteractiveDiffInterpreter[T] {
  def interpret(diff: T, interaction: HttpInteraction): Seq[InteractiveDiffInterpretation]
}