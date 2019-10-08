package com.seamless.diff.interpreters

import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.contexts.shapes.Commands._
import com.seamless.contexts.shapes.ShapesHelper.OneOfKind
import com.seamless.contexts.shapes._
import com.seamless.diff.RequestDiffer.RequestDiffResult
import com.seamless.diff.ShapeDiffer._
import com.seamless.diff._
import com.seamless.diff.initial.ShapeBuilder
import io.circe.Json

class OneOfInterpreter(_shapesState: ShapesState) extends Interpreter[RequestDiffResult] {
  override def interpret(diff: RequestDiffResult): Seq[DiffInterpretation] = {
    implicit val shapesState: ShapesState = _shapesState
    implicit val bindings: ParameterBindings = Map.empty
    diff match {
      case d: RequestDiffer.UnmatchedRequestBodyShape => {
        d.shapeDiff match {
          case sd: ListItemShapeMismatch => {
            Seq(
              ConvertToOneOf(sd.expectedItem, sd.actualItem, id => Seq(
                SetParameterShape(ProviderInShape(sd.expectedList.shapeId, ShapeProvider(id), "$listItem"))
              ))
            )
          }
          case _ => Seq.empty
        }
      }
      case d: RequestDiffer.UnmatchedResponseBodyShape => {
        d.shapeDiff match {
          case sd: ListItemShapeMismatch => {
            Seq(
              ConvertToOneOf(sd.expectedItem, sd.actualItem, id => Seq(
                SetParameterShape(ProviderInShape(sd.expectedList.shapeId, ShapeProvider(id), "$listItem"))
              ))
            )
          }
          case _ => Seq.empty
        }
      }
      case _ => Seq.empty
    }
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
  }

  def ConvertToOneOf(expectedShape: ShapeEntity, actual: Json, f: Function[ShapeId, Seq[RfcCommand]]) = {
    val wrapperShapeId = ShapesHelper.newShapeId()
    val p1 = ShapesHelper.newShapeParameterId()
    val p2 = ShapesHelper.newShapeParameterId()
    val result = new ShapeBuilder(actual).run

    val commands =
      result.commands ++ Seq(
        AddShape(wrapperShapeId, OneOfKind.baseShapeId, ""),
        AddShapeParameter(p1, wrapperShapeId, ""),
        AddShapeParameter(p2, wrapperShapeId, ""),
        SetParameterShape(ProviderInShape(wrapperShapeId, ShapeProvider(expectedShape.shapeId), p1)),
        SetParameterShape(ProviderInShape(wrapperShapeId, ShapeProvider(result.rootShapeId), p2))
      ) ++ f(wrapperShapeId)

    DiffInterpretation(
      "Multiple Shapes Observed",
      "Optic observed multiple different shapes. If it can be any of these shapes, make it a OneOf",
      commands,
      FrontEndMetadata(
        example = Some(actual),
        affectedIds = Seq(expectedShape.shapeId)
      )
    )
  }
}
