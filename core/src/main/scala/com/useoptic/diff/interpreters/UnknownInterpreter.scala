package com.useoptic.diff.interpreters

import com.useoptic.contexts.shapes.Commands._
import com.useoptic.contexts.shapes._
import com.useoptic.diff.{DiffInterpretation, DynamicDescription, FrontEndMetadata, InterpretationContext, ShapeLikeJs}
import com.useoptic.diff.RequestDiffer.{RequestDiffResult, UnmatchedRequestBodyShape, UnmatchedResponseBodyShape}
import com.useoptic.diff.ShapeDiffer.NoExpectedShape
import com.useoptic.diff.initial.ShapeBuilder
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


  def ChangeUnknownToSomething(expectedShapeId: ShapeId, raw: ShapeLikeJs, shapesState: ShapesState, context: InterpretationContext) = {
    val actualJson = raw.json.get
    val shapeBuilder = new ShapeBuilder(actualJson)
    val result = shapeBuilder.run
    val commands = result.commands ++ Seq(
      SetBaseShape(expectedShapeId, result.rootShapeId)
    )
    //println(commands)
    DiffInterpretation(
      "Replace Unknown",
      DynamicDescription(s"Replace Unknown with `{{shapeId_SHAPE}}`", shapeId = Some(result.rootShapeId)),
      commands,
      context,
      FrontEndMetadata(changedIds = Seq(expectedShapeId))
    )
  }
}
