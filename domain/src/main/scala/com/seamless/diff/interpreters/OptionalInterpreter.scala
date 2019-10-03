package com.seamless.diff.interpreters

import com.seamless.contexts.requests.Commands.{SetRequestBodyShape, SetResponseBodyShape, ShapedBodyDescriptor}
import com.seamless.contexts.shapes.Commands._
import com.seamless.contexts.shapes._
import com.seamless.contexts.shapes.ShapesHelper._
import com.seamless.diff.DiffInterpretation
import com.seamless.diff.RequestDiffer._
import com.seamless.diff.ShapeDiffer._

class OptionalInterpreter(shapesState: ShapesState) extends Interpreter[RequestDiffResult] {
  override def interpret(diff: RequestDiffResult): Seq[DiffInterpretation] = {
    diff match {
      case d: UnmatchedRequestBodyShape => {
        d.shapeDiff match {
          case sd: UnsetValue => {
            Seq(
              ChangeShapeToOptional(d, sd)
            )
          }
          case sd: UnsetObjectKey => {
            Seq(
              ChangeFieldToOptional(sd)
            )
          }
          case sd: UnexpectedObjectKey => {
            //@TODO: should add the observed shape and wrap with Optional
            Seq.empty
          }
          case _ => Seq.empty
        }
      }
      case d: UnmatchedResponseBodyShape => {
        d.shapeDiff match {
          case sd: UnsetValue => {
            Seq(
              ChangeShapeToOptional(d, sd)
            )
          }
          case sd: UnsetObjectKey => {
            Seq(
              ChangeFieldToOptional(sd)
            )
          }
          case _ => Seq.empty
        }
      }
      case _ => Seq.empty
    }
  }

  def ChangeFieldToOptional(shapeDiff: UnsetObjectKey): DiffInterpretation = {
    val wrapperShapeId = ShapesHelper.newShapeId()
    val field = shapesState.flattenedField(shapeDiff.fieldId)
    val commands = Seq(
      AddShape(wrapperShapeId, OptionalKind.baseShapeId, ""),
      SetParameterShape(
        ProviderInShape(
          wrapperShapeId,
          field.fieldShapeDescriptor match {
            case fs: FieldShapeFromShape => ShapeProvider(fs.shapeId)
            case fs: FieldShapeFromParameter => ParameterProvider(fs.shapeParameterId)
          },
          "$optionalInner"
        )
      ),
      SetFieldShape(FieldShapeFromShape(field.fieldId, wrapperShapeId)),
    )
    DiffInterpretation(
      "No key Observed",
      s"Optic expected to see a value for the key ${shapeDiff.key}. If it is allowed to be omitted, make it Optional",
      commands
    )
  }

  def ChangeShapeToOptional(requestDiffResult: UnmatchedRequestBodyShape, shapeDiff: UnsetValue): DiffInterpretation = {
    val wrapperShapeId = ShapesHelper.newShapeId()
    val commands = Seq(
      AddShape(wrapperShapeId, OptionalKind.baseShapeId, ""),
      SetParameterShape(
        ProviderInShape(wrapperShapeId, ShapeProvider(shapeDiff.expected.shapeId), "$optionalInner")
      ),
      SetRequestBodyShape(requestDiffResult.requestId, ShapedBodyDescriptor(requestDiffResult.contentType, wrapperShapeId, isRemoved = false))
    )
    DiffInterpretation(
      "No value Observed",
      s"Optic expected to see a value for the request but instead saw nothing. If it is allowed to be omitted, make it Optional",
      commands
    )
  }

  def ChangeShapeToOptional(requestDiffResult: UnmatchedResponseBodyShape, shapeDiff: UnsetValue): DiffInterpretation = {
    val wrapperShapeId = ShapesHelper.newShapeId()
    val commands = Seq(
      AddShape(wrapperShapeId, OptionalKind.baseShapeId, ""),
      SetParameterShape(
        ProviderInShape(wrapperShapeId, ShapeProvider(shapeDiff.expected.shapeId), "$optionalInner")
      ),
      SetResponseBodyShape(requestDiffResult.responseId, ShapedBodyDescriptor(requestDiffResult.contentType, wrapperShapeId, isRemoved = false))
    )
    DiffInterpretation(
      "No value Observed",
      s"Optic expected to see a value for the response but instead saw nothing. If it is allowed to be omitted, make it Optional",
      commands
    )
  }
}
