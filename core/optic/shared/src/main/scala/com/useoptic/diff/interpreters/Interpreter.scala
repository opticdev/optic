package com.useoptic.diff.interpreters

import com.useoptic.diff.DiffInterpretation

import scala.scalajs.js.annotation.{ JSExportAll, JSExportDescendentClasses}

@JSExportAll
@JSExportDescendentClasses
trait Interpreter[T] {
  def interpret(diff: T): Seq[DiffInterpretation]
}
