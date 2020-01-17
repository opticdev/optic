package com.useoptic.diff.interpreters

import com.useoptic.contexts.shapes.Commands._
import com.useoptic.contexts.shapes.{ShapesHelper, ShapesState}
import com.useoptic.diff.{DiffInterpretation, DynamicDescription, FrontEndMetadata, InterpretationContext, ShapeLike}
import com.useoptic.diff.RequestDiffer.{RequestDiffResult, UnmatchedQueryParameterShape}
import com.useoptic.diff.ShapeDiffer.{KeyShapeMismatch, NullObjectKey, UnexpectedObjectKey, UnsetObjectKey}
import com.useoptic.diff.initial.ShapeBuilder
import io.circe.Json

class QueryParameterInterpreter(shapesState: ShapesState) extends Interpreter[RequestDiffResult] {
  override def interpret(diff: RequestDiffResult): Seq[DiffInterpretation] = {
    diff match {
      case d: UnmatchedQueryParameterShape => {
        d.shapeDiff match {
          case sd: UnexpectedObjectKey => {
            //@todo make sure this works as expected
            val result = new ShapeBuilder(sd.actual.json.getOrElse(Json.obj())).run
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
