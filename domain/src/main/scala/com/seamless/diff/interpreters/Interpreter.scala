package com.seamless.diff.interpreters

import com.seamless.diff.DiffInterpretation

import scala.scalajs.js.annotation.{ JSExportAll, JSExportDescendentClasses}

@JSExportAll
@JSExportDescendentClasses
trait Interpreter[T] {
  def interpret(diff: T): Seq[DiffInterpretation]
}
