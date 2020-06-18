package com.useoptic.diff.interactions.interpreters

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.diff.InteractiveDiffInterpretation
import com.useoptic.diff.interactions.InteractionDiffResult
import com.useoptic.diff.interpreters.InteractiveDiffInterpreter
import com.useoptic.diff.shapes.resolvers.ShapesResolvers
import com.useoptic.dsa.OpticDomainIds
import com.useoptic.types.capture.HttpInteraction

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
class DefaultInterpreters(resolvers: ShapesResolvers, rfcState: RfcState)(implicit ids: OpticDomainIds) extends InteractiveDiffInterpreter[InteractionDiffResult] {
  val basicInterpreters = new BasicInterpreters(rfcState)
  val unspecifiedShapeDiffInterpreter = new UnspecifiedShapeDiffInterpreter(resolvers, rfcState)
  val missingValueInterpreter = new MissingValueInterpreter(rfcState)

  override def interpret(diff: InteractionDiffResult, interactions: Vector[HttpInteraction]): Seq[InteractiveDiffInterpretation] = {
    (
      basicInterpreters.interpret(diff, interactions)
        ++ unspecifiedShapeDiffInterpreter.interpret(diff, interactions)
        ++ missingValueInterpreter.interpret(diff, interactions)
      )
  }

  override def interpret(diff: InteractionDiffResult, interaction: HttpInteraction): Seq[InteractiveDiffInterpretation] = interpret(diff, Vector(interaction))
}
