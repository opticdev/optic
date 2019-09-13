package com.seamless.diff.interpreters

import com.seamless.diff.DiffInterpretation
import com.seamless.diff.RequestDiffer.RequestDiffResult

trait Interpreter {
  def interpret(diff: RequestDiffResult): Seq[DiffInterpretation]
}
