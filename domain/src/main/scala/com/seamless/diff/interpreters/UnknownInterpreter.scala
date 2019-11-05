package com.seamless.diff.interpreters

import com.seamless.contexts.shapes.Commands._
import com.seamless.contexts.shapes._
import com.seamless.diff.{DiffInterpretation, FrontEndMetadata, HighlightNestedRequestShape, HighlightNestedResponseShape, HighlightNestedShape, InterpretationContext}
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
                  ChangeUnknownToSomething(sd.expected.shapeId, raw, shapesState, HighlightNestedRequestShape(sd.expected.shapeId), InterpretationContext(None, true))
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
                  ChangeUnknownToSomething(sd.expected.shapeId, raw, shapesState, HighlightNestedResponseShape(d.responseStatusCode, sd.expected.shapeId), InterpretationContext(Some(d.responseId), false))
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


  def ChangeUnknownToSomething(expectedShapeId: ShapeId, raw: Json, shapesState: ShapesState,  highlightNested: HighlightNestedShape, context: InterpretationContext) = {
    val shapeBuilder = new ShapeBuilder(raw)
    val result = shapeBuilder.run
    val commands = result.commands ++ Seq(
      SetBaseShape(expectedShapeId, result.rootShapeId)
    )
    println(commands)
    DiffInterpretation(
      "Replace Unknown with Shape",
//      "Optic observed this shape for the first time. Is this the expected shape?",
      commands,
      context,
      FrontEndMetadata(example = Some(raw), affectedIds = Seq(expectedShapeId), added = true, highlightNestedShape = Some(highlightNested))
    )
  }
}
