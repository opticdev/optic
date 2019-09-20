package com.seamless.diff.interpreters

import com.seamless.contexts.shapes.ShapesState
import com.seamless.diff.RequestDiffer.RequestDiffResult
import com.seamless.diff.ShapeDiffer._
import com.seamless.diff._

class OneOfInterpreter(_shapesState: ShapesState) extends Interpreter[RequestDiffResult] {
  override def interpret(diff: RequestDiffResult): Seq[DiffInterpretation] = {
    implicit val shapesState: ShapesState = _shapesState
    implicit val bindings: ParameterBindings = Map.empty
    //    val y = diff match {
    //      case d: RequestDiffer.UnmatchedRequestBodyShape => {
    //        d.shapeDiff match {
    //          case sd: MultipleInterpretations => {
    //            {
    //              val shapeParameterIds = sd.expected.descriptor.parameters match {
    //                case DynamicParameterList(shapeParameterIds) => shapeParameterIds
    //              }
    //              val x = shapeParameterIds.flatMap(shapeParameterId => {
    //                val referencedShape = resolveParameterShape(sd.expected.shapeId, shapeParameterId)
    //                if (referencedShape.isDefined) {
    //                  Some(Interpretations.RequireManualIntervention("you're out of luck pal", Seq.empty))
    //                } else {
    //                  None
    //                }
    //              })
    //              x
    //            }
    //          }
    //          case sd: ShapeMismatch => {
    //
    //          }
    //          case sd: KeyShapeMismatch => {
    //
    //          }
    //          case _ => None
    //        }
    //      }
    //      case _ => None
    //    }
    Seq.empty
  }
}
