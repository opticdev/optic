package com.useoptic.diff.interactions.interpreters

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.diff.InteractiveDiffInterpretation
import com.useoptic.diff.interactions.InteractionDiffResult
import com.useoptic.diff.interpreters.InteractiveDiffInterpreter
import com.useoptic.types.capture.HttpInteraction

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
class DefaultInterpreters(rfcState: RfcState) extends InteractiveDiffInterpreter[InteractionDiffResult] {
  val basicInterpreters = new BasicInterpreters(rfcState)
  val unspecifiedShapeDiffInterpreter = new UnspecifiedShapeDiffInterpreter(rfcState)

  override def interpret(diff: InteractionDiffResult, interaction: HttpInteraction): Seq[InteractiveDiffInterpretation] = {
    basicInterpreters.interpret(diff, interaction) ++ unspecifiedShapeDiffInterpreter.interpret(diff, interaction)
  }
}
