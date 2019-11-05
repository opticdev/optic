package com.seamless.diff.interpreters

import com.seamless.diff.RequestDiffer.RequestDiffResult
import com.seamless.diff.{DiffInterpretation, InterpretationContext, RequestDiffer}

class UnmatchedUrlInterpreter extends Interpreter[RequestDiffResult] {
  override def interpret(diff: RequestDiffResult): Seq[DiffInterpretation] = {
    diff match {
      case d: RequestDiffer.UnmatchedUrl => Seq(
        DiffInterpretation(
          "Unrecognized URL Observed",
//          "Optic saw a request to a url that does not match any paths",
          Seq.empty,
          InterpretationContext(None, false)
        )
      )
      case _ => Seq.empty
    }
  }
}
