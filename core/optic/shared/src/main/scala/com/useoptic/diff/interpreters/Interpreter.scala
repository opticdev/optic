package com.useoptic.diff.interpreters

import com.useoptic.diff.InteractiveDiffInterpretation
import com.useoptic.types.capture.HttpInteraction

trait InteractiveDiffInterpreter[T] {
  def interpret(diff: T, interactions: Vector[HttpInteraction]): Seq[InteractiveDiffInterpretation]
  def interpret(diff: T, interaction: HttpInteraction): Seq[InteractiveDiffInterpretation]
}
