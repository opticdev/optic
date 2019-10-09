package com.seamless.diff.interpreters

import com.seamless.contexts.shapes.ShapesState
import com.seamless.diff.DiffInterpretation
import com.seamless.diff.RequestDiffer._

class CompoundInterpreter(_shapesState: ShapesState) extends Interpreter[RequestDiffResult] {
  val unknownInterpreter = new UnknownInterpreter(_shapesState)
  val oneOfInterpreter = new OneOfInterpreter(_shapesState)
  val nullableInterpreter = new NullableInterpreter(_shapesState)
  val optionalInterpreter = new OptionalInterpreter(_shapesState)
  val basicDiffInterpreter = new BasicDiffInterpreter(_shapesState)

  override def interpret(diff: RequestDiffResult): Seq[DiffInterpretation] = {
    unknownInterpreter.interpret(diff) ++
      nullableInterpreter.interpret(diff) ++
      optionalInterpreter.interpret(diff) ++
      oneOfInterpreter.interpret(diff) ++
      basicDiffInterpreter.interpret(diff)
  }
}
