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
              ConvertToOneOf(sd.expectedItem, sd.actualItem, sd.expectedList.shapeId, id => Seq(
                SetParameterShape(ProviderInShape(sd.expectedList.shapeId, ShapeProvider(id), "$listItem"))
              ))
            )
          }
          case sd: KeyShapeMismatch => {
            Seq(
              ConvertToOneOf(sd.expected, sd.actual, sd.fieldId, id => Seq(
                SetFieldShape(FieldShapeFromShape(sd.fieldId, id))
              ))
            )
          }
          case sd: MultipleInterpretations => {
            Seq(
              AddToOneOf(sd.expected, sd.actual)
            )
          }
          case _ => Seq.empty
        }
      }
      case d: RequestDiffer.UnmatchedResponseBodyShape => {
        d.shapeDiff match {
          case sd: ListItemShapeMismatch => {
            Seq(
              ConvertToOneOf(sd.expectedItem, sd.actualItem, sd.expectedList.shapeId, id => Seq(
                SetParameterShape(ProviderInShape(sd.expectedList.shapeId, ShapeProvider(id), "$listItem"))
              ))
            )
          }
          case sd: KeyShapeMismatch => {
            Seq(
              ConvertToOneOf(sd.expected, sd.actual, sd.fieldId, id => Seq(
                SetFieldShape(FieldShapeFromShape(sd.fieldId, id))
              )))
          }
          case sd: MultipleInterpretations => {
            Seq(
              AddToOneOf(sd.expected, sd.actual)
            )
          }
          case _ => Seq.empty
        }
      }
      case _ => Seq.empty
    }
  }

  def ConvertToOneOf(expectedShape: ShapeEntity, actual: Json, affectedId: ShapeId, f: Function[ShapeId, Seq[RfcCommand]]) = {
    val wrapperShapeId = ShapesHelper.newShapeId()
    val p1 = ShapesHelper.newShapeParameterId()
    val p2 = ShapesHelper.newShapeParameterId()
    val result = new ShapeBuilder(actual).run

    val commands =
      result.commands ++ Seq(
        AddShape(wrapperShapeId, OneOfKind.baseShapeId, ""),
        AddShapeParameter(p1, wrapperShapeId, ""),
        SetParameterShape(ProviderInShape(wrapperShapeId, ShapeProvider(expectedShape.shapeId), p1)),
        AddShapeParameter(p2, wrapperShapeId, ""),
        SetParameterShape(ProviderInShape(wrapperShapeId, ShapeProvider(result.rootShapeId), p2))
      ) ++ f(wrapperShapeId)

    DiffInterpretation(
      "Change to a One Of",
//      "Optic observed multiple different shapes. If it can be any of these shapes, make it a OneOf",
      commands,
      FrontEndMetadata(
        example = Some(actual),
        affectedIds = Seq(affectedId, p1, p2),
        changed = true
      )
    )
  }

  def AddToOneOf(expected: ShapeEntity, actual: Json) = {
    val p1 = ShapesHelper.newShapeParameterId()
    val result = new ShapeBuilder(actual).run
    val commands = result.commands ++ Seq(
      AddShapeParameter(p1, expected.shapeId, ""),
      SetParameterShape(ProviderInShape(expected.shapeId, ShapeProvider(result.rootShapeId), p1))
    )

    DiffInterpretation(
      "Add to One Of",
//      "Optic observed a shape that did not match any of the expected shapes. If it is expected, add it to the choices",
      commands,
      FrontEndMetadata(
        example = Some(actual),
        affectedIds = Seq(expected.shapeId),
        changed = true
      )
    )
  }
}
