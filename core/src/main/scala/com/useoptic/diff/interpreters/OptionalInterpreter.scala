package com.useoptic.diff.interpreters

import com.useoptic.contexts.requests.Commands.{SetRequestBodyShape, SetResponseBodyShape, ShapedBodyDescriptor}
import com.useoptic.contexts.shapes.Commands._
import com.useoptic.contexts.shapes._
import com.useoptic.contexts.shapes.ShapesHelper._
import com.useoptic.diff.{DiffInterpretation, DynamicDescription, FrontEndMetadata, InterpretationContext}
import com.useoptic.diff.RequestDiffer._
import com.useoptic.diff.ShapeDiffer._

import scala.util.Try

class OptionalInterpreter(shapesState: ShapesState) extends Interpreter[RequestDiffResult] {
  override def interpret(diff: RequestDiffResult): Seq[DiffInterpretation] = {
    diff match {
      case d: UnmatchedQueryParameterShape => {
        d.shapeDiff match {
          case sd: UnsetObjectKey => {
            Seq(
              ChangeFieldToOptional(sd, InterpretationContext(None, true))
            )
          }
          case _ => Seq.empty
        }
      }
      case d: UnmatchedRequestBodyShape => {
        d.shapeDiff match {
          case sd: UnsetValue => {
            Seq(
              ChangeShapeToOptional(d, sd, InterpretationContext(None, true))
            )
          }
          case sd: UnsetObjectKey => {
            Seq(
              ChangeFieldToOptional(sd, InterpretationContext(None, true))
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
              ChangeShapeToOptional(d, sd, InterpretationContext(Some(d.responseId), false))
            )
          }
          case sd: UnsetObjectKey => {
            Seq(
              ChangeFieldToOptional(sd, InterpretationContext(Some(d.responseId), false))
            )
          }
          case _ => Seq.empty
        }
      }
      case _ => Seq.empty
    }
  }

  def ChangeFieldToOptional(shapeDiff: UnsetObjectKey, context: InterpretationContext): DiffInterpretation = {
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
          OptionalKind.innerParam
        )
      ),
      SetFieldShape(FieldShapeFromShape(field.fieldId, wrapperShapeId)),
    )
    DiffInterpretation(
      s"Make Optional",
      DynamicDescription(s"Make `${shapeDiff.key}` `optional`"),
//      s"Optic expected to see a value for the key ${shapeDiff.key}. If it is allowed to be omitted, make it Optional",
      commands,
      context,
      FrontEndMetadata(changedIds = Seq(shapeDiff.fieldId))
    )
  }

  def ChangeShapeToOptional(requestDiffResult: UnmatchedRequestBodyShape, shapeDiff: UnsetValue,  context: InterpretationContext): DiffInterpretation = {
    val wrapperShapeId = ShapesHelper.newShapeId()
    val commands = Seq(
      AddShape(wrapperShapeId, OptionalKind.baseShapeId, ""),
      SetParameterShape(
        ProviderInShape(wrapperShapeId, ShapeProvider(shapeDiff.expected.shapeId), OptionalKind.innerParam)
      ),
      SetRequestBodyShape(requestDiffResult.requestId, ShapedBodyDescriptor(requestDiffResult.contentType, wrapperShapeId, isRemoved = false))
    )
    DiffInterpretation(
      "Make Request Optional",
      DynamicDescription(s"Make request `optional`"),
//      s"Optic expected to see a value for the request but instead saw nothing. If it is allowed to be omitted, make it Optional",
      commands,
      context,
      FrontEndMetadata(changedIds = Seq(shapeDiff.expected.shapeId))
    )
  }

  def ChangeShapeToOptional(requestDiffResult: UnmatchedResponseBodyShape, shapeDiff: UnsetValue,  context: InterpretationContext): DiffInterpretation = {
    val wrapperShapeId = ShapesHelper.newShapeId()
    val commands = Seq(
      AddShape(wrapperShapeId, OptionalKind.baseShapeId, ""),
      SetParameterShape(
        ProviderInShape(wrapperShapeId, ShapeProvider(shapeDiff.expected.shapeId), OptionalKind.innerParam)
      ),
      SetResponseBodyShape(requestDiffResult.responseId, ShapedBodyDescriptor(requestDiffResult.contentType, wrapperShapeId, isRemoved = false))
    )
    DiffInterpretation(
      "Make Request Optional",
      DynamicDescription(s"Make response `optional`"),
//      s"Optic expected to see a value for the response but instead saw nothing. If it is allowed to be omitted, make it Optional",
      commands,
      context,
      FrontEndMetadata(changedIds = Seq(shapeDiff.expected.shapeId))
    )
  }
}
