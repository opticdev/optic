package com.seamless.diff.interpreters

import com.seamless.contexts.requests.Commands.{SetRequestBodyShape, SetResponseBodyShape, ShapedBodyDescriptor}
import com.seamless.contexts.shapes.Commands._
import com.seamless.contexts.shapes._
import com.seamless.contexts.shapes.ShapesHelper._
import com.seamless.diff.{DiffInterpretation, FrontEndMetadata}
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
    val field = shapesState.flattenedField(shapeDiff.fieldId)
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
      s"Make ${shapeDiff.key} nullable",
//      s"Optic expected to see a value for the key ${shapeDiff.key} and instead saw null. If it is allowed to be null, make it Nullable",
      commands,
      FrontEndMetadata(affectedIds = Seq(shapeDiff.parentObjectShapeId, shapeDiff.fieldId), changed = true)
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
      "Make Request Body nullable",
//      s"Optic expected to see a value for the request but instead saw null. If it is allowed to be null, make it Nullable",
      commands,
      FrontEndMetadata(affectedIds = Seq(shapeDiff.expected.shapeId), changed = true)
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
      "Makes Response Body nullable",
//      s"Optic expected to see a value for the request but instead saw null. If it is allowed to be null, make it Nullable",
      commands,
      FrontEndMetadata(affectedIds = Seq(shapeDiff.expected.shapeId), changed = true)
    )
  }
}
