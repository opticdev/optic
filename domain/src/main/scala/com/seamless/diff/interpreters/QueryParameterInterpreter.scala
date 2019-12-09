package com.seamless.diff.interpreters

import com.seamless.contexts.shapes.Commands._
import com.seamless.contexts.shapes.{ShapesHelper, ShapesState}
import com.seamless.diff.{DiffInterpretation, DynamicDescription, FrontEndMetadata, InterpretationContext}
import com.seamless.diff.RequestDiffer.{RequestDiffResult, UnmatchedQueryParameterShape}
import com.seamless.diff.ShapeDiffer.{KeyShapeMismatch, NullObjectKey, UnexpectedObjectKey, UnsetObjectKey}
import com.seamless.diff.initial.ShapeBuilder

class QueryParameterInterpreter(shapesState: ShapesState) extends Interpreter[RequestDiffResult] {
  override def interpret(diff: RequestDiffResult): Seq[DiffInterpretation] = {
    diff match {
      case d: UnmatchedQueryParameterShape => {
        d.shapeDiff match {
          case sd: UnexpectedObjectKey => {
          val result = new ShapeBuilder(sd.actual).run
            val newFieldId = ShapesHelper.newFieldId()
            val commands = result.commands ++ Seq(
              AddField(newFieldId, sd.parentObjectShapeId, sd.key, FieldShapeFromShape(newFieldId, result.rootShapeId))
            )
            Seq(
              DiffInterpretation(
                "Add Query Parameter",
                DynamicDescription(s"Add `${sd.key}`"),
                commands,
                InterpretationContext(None, inRequestBody = true),
                FrontEndMetadata(addedIds = Seq(newFieldId, result.rootShapeId))
              )
            )
          }
          case sd: UnsetObjectKey => {
            // handled in OptionalInterpreter
            Seq.empty
          }
          case sd: KeyShapeMismatch => {
            // handled in OneOfInterpreter
            Seq.empty
          }
          case sd: NullObjectKey => {
            // handled in NullableInterpreter
            Seq.empty
          }
          case _ => Seq.empty
        }

      }
      case _ => Seq.empty
    }
  }
}
