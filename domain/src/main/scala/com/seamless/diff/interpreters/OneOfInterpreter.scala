package com.seamless.diff.interpreters

import com.seamless.contexts.shapes.Commands.DynamicParameterList
import com.seamless.contexts.shapes.ShapesState
import com.seamless.diff.ShapeDiffer._
import com.seamless.diff._

class OneOfInterpreter(_shapesState: ShapesState) extends Interpreter {
  override def interpret(diff: ShapeDiffResult): Seq[DiffInterpretation] = {
    implicit val shapesState: ShapesState = _shapesState
    implicit val bindings: ParameterBindings = Map.empty
    val interpretations = diff match {
      case d: ShapeDiffer.MultipleInterpretations => {
        val shapeParameterIds = d.expected.descriptor.parameters match {
          case DynamicParameterList(shapeParameterIds) => shapeParameterIds
        }
        val x = shapeParameterIds.flatMap(shapeParameterId => {
          val referencedShape = resolveParameterShape(d.expected.shapeId, shapeParameterId)
          if (referencedShape.isDefined) {
            Seq(Interpretations.RequireManualIntervention("you're out of luck pal", Seq.empty))
          } else {
            Seq.empty[DiffInterpretation]
          }
        })
        x
      }
      case _ => Seq.empty[DiffInterpretation]
    }
    interpretations
  }
}
