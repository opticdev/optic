package com.seamless.diff.interpreters

import com.seamless.contexts.requests.Commands.{SetRequestBodyShape, SetResponseBodyShape, ShapedBodyDescriptor}
import com.seamless.contexts.shapes.Commands._
import com.seamless.contexts.shapes._
import com.seamless.contexts.shapes.ShapesHelper._
import com.seamless.diff.DiffInterpretation
import com.seamless.diff.RequestDiffer._
import com.seamless.diff.ShapeDiffer._

class NullableInterpreter(shapesState: ShapesState) extends Interpreter[RequestDiffResult] {
  override def interpret(diff: RequestDiffResult): Seq[DiffInterpretation] = {
    diff match {
      case d: UnmatchedRequestBodyShape => {
        d.shapeDiff match {
          case sd: NullValue => {
            Seq(
              ChangeShapeToNullable(d, sd)
            )
          }
          case sd: NullObjectKey => {
            Seq(
              ChangeFieldToNullable(sd)
            )
          }
          case _ => Seq.empty
        }
      }
      case d: UnmatchedResponseBodyShape => {
        d.shapeDiff match {
          case sd: NullValue => {
            Seq(
              ChangeShapeToNullable(d, sd)
            )
          }
          case sd: NullObjectKey => {
            Seq(
              ChangeFieldToNullable(sd)
            )
          }
          case _ => Seq.empty
        }
      }
      case _ => Seq.empty
    }
  }

  def ChangeFieldToNullable(shapeDiff: NullObjectKey): DiffInterpretation = {
    val wrapperShapeId = ShapesHelper.newShapeId()
    val parentObject = shapesState.flattenedShape(shapeDiff.parentObjectShapeId)
    val field = parentObject.fields.find(x => x.name == shapeDiff.key).get
    val commands = Seq(
      AddShape(wrapperShapeId, NullableKind.baseShapeId, ""),
      SetParameterShape(
        ProviderInShape(
          wrapperShapeId,
          field.fieldShapeDescriptor match {
            case fs: FieldShapeFromShape => ShapeProvider(fs.shapeId)
            case fs: FieldShapeFromParameter => ParameterProvider(fs.shapeParameterId)
          },
          "$nullableInner"
        )
      ),
      SetFieldShape(FieldShapeFromShape(field.fieldId, wrapperShapeId)),
    )
    DiffInterpretation(
      "Null value Observed",
      s"Optic expected to see a value for the key ${shapeDiff.key} and instead saw null. If it is allowed to be null, make it Nullable",
      commands
    )
  }

  def ChangeShapeToNullable(requestDiffResult: UnmatchedRequestBodyShape, shapeDiff: NullValue): DiffInterpretation = {
    val wrapperShapeId = ShapesHelper.newShapeId()
    val commands = Seq(
      AddShape(wrapperShapeId, NullableKind.baseShapeId, ""),
      SetParameterShape(
        ProviderInShape(wrapperShapeId, ShapeProvider(shapeDiff.expected.shapeId), "$nullableInner")
      ),
      SetRequestBodyShape(requestDiffResult.requestId, ShapedBodyDescriptor(requestDiffResult.contentType, wrapperShapeId, isRemoved = false))
    )
    DiffInterpretation(
      "Null value Observed",
      s"Optic expected to see a value for the request but instead saw null. If it is allowed to be null, make it Nullable",
      commands
    )
  }

  def ChangeShapeToNullable(requestDiffResult: UnmatchedResponseBodyShape, shapeDiff: NullValue): DiffInterpretation = {
    val wrapperShapeId = ShapesHelper.newShapeId()
    val commands = Seq(
      AddShape(wrapperShapeId, NullableKind.baseShapeId, ""),
      SetParameterShape(
        ProviderInShape(wrapperShapeId, ShapeProvider(shapeDiff.expected.shapeId), "$nullableInner")
      ),
      SetResponseBodyShape(requestDiffResult.responseId, ShapedBodyDescriptor(requestDiffResult.contentType, wrapperShapeId, isRemoved = false))
    )
    DiffInterpretation(
      "Null value Observed",
      s"Optic expected to see a value for the request but instead saw null. If it is allowed to be null, make it Nullable",
      commands
    )
  }
}
