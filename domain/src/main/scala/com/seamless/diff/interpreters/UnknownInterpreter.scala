package com.seamless.diff.interpreters

import com.seamless.contexts.shapes.Commands._
import com.seamless.contexts.shapes._
import com.seamless.diff.{DiffInterpretation, DynamicDescription, FrontEndMetadata, InterpretationContext}
import com.seamless.diff.RequestDiffer.{RequestDiffResult, UnmatchedRequestBodyShape, UnmatchedResponseBodyShape}
import com.seamless.diff.ShapeDiffer.NoExpectedShape
import com.seamless.diff.initial.ShapeBuilder
import io.circe.Json


class UnknownInterpreter(shapesState: ShapesState) extends Interpreter[RequestDiffResult] {
  override def interpret(diff: RequestDiffResult): Seq[DiffInterpretation] = {
    diff match {
      case d: UnmatchedRequestBodyShape => {
        d.shapeDiff match {
          case sd: NoExpectedShape => {
            sd.actual match {
              case None => {
                //@TODO: wrap with optional
                Seq.empty
              }
              case Some(raw) => {
                Seq(
                  ChangeUnknownToSomething(sd.expected.shapeId, raw, shapesState, InterpretationContext(None, true))
                )
              }
            }
          }
          case _ => Seq.empty
        }
      }
      case d: UnmatchedResponseBodyShape => {
        d.shapeDiff match {
          case sd: NoExpectedShape => {
            sd.actual match {
              case None => {
                //@TODO: wrap with optional
                Seq.empty
              }
              case Some(raw) => {
                Seq(
                  ChangeUnknownToSomething(sd.expected.shapeId, raw, shapesState, InterpretationContext(Some(d.responseId), false))
                )
              }
            }
          }
          case _ => Seq.empty
        }
      }
      case _ => Seq.empty
    }
  }


  def ChangeUnknownToSomething(expectedShapeId: ShapeId, raw: Json, shapesState: ShapesState, context: InterpretationContext) = {
    val shapeBuilder = new ShapeBuilder(raw)
    val result = shapeBuilder.run
    val commands = result.commands ++ Seq(
      SetBaseShape(expectedShapeId, result.rootShapeId)
    )
    println(commands)
    DiffInterpretation(
      "Replace Unknown",
      DynamicDescription(s"Replace Unknown with `{{shapeId_SHAPE}}`"),
      commands,
      context,
      FrontEndMetadata(changedIds = Seq(expectedShapeId))
    )
  }
}
