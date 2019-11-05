package com.seamless.diff.interpreters

import com.seamless.contexts.requests.Commands.{SetRequestBodyShape, SetResponseBodyShape, ShapedBodyDescriptor}
import com.seamless.contexts.shapes.Commands._
import com.seamless.contexts.shapes._
import com.seamless.contexts.shapes.ShapesHelper._
import com.seamless.diff.{DiffInterpretation, FrontEndMetadata, HighlightNestedRequestShape, HighlightNestedResponseShape, HighlightNestedShape, InterpretationContext}
import com.seamless.diff.RequestDiffer._
import com.seamless.diff.ShapeDiffer._

import scala.util.Try

class OptionalInterpreter(shapesState: ShapesState) extends Interpreter[RequestDiffResult] {
  override def interpret(diff: RequestDiffResult): Seq[DiffInterpretation] = {
    diff match {
      case d: UnmatchedRequestBodyShape => {
        d.shapeDiff match {
          case sd: UnsetValue => {
            Seq(
              ChangeShapeToOptional(d, sd, InterpretationContext(None, true))
            )
          }
          case sd: UnsetObjectKey => {
            Seq(
              ChangeFieldToOptional(sd, HighlightNestedRequestShape(sd.parentObjectShapeId), InterpretationContext(None, true))
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
              ChangeFieldToOptional(sd, HighlightNestedResponseShape(d.responseStatusCode, sd.parentObjectShapeId), InterpretationContext(Some(d.responseId), false))
            )
          }
          case _ => Seq.empty
        }
      }
      case _ => Seq.empty
    }
  }

  def ChangeFieldToOptional(shapeDiff: UnsetObjectKey, highlightNested: HighlightNestedShape, context: InterpretationContext): DiffInterpretation = {
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
      s"Make <b>${shapeDiff.key}</b> Optional",
//      s"Optic expected to see a value for the key ${shapeDiff.key}. If it is allowed to be omitted, make it Optional",
      commands,
      context,
      FrontEndMetadata(affectedIds = Seq(shapeDiff.fieldId), changed = true, highlightNestedShape = Some(highlightNested))
    )
  }

  def ChangeShapeToOptional(requestDiffResult: UnmatchedRequestBodyShape, shapeDiff: UnsetValue,  context: InterpretationContext): DiffInterpretation = {
    val wrapperShapeId = ShapesHelper.newShapeId()
    val commands = Seq(
      AddShape(wrapperShapeId, OptionalKind.baseShapeId, ""),
      SetParameterShape(
        ProviderInShape(wrapperShapeId, ShapeProvider(shapeDiff.expected.shapeId), "$optionalInner")
      ),
      SetRequestBodyShape(requestDiffResult.requestId, ShapedBodyDescriptor(requestDiffResult.contentType, wrapperShapeId, isRemoved = false))
    )

    DiffInterpretation(
      "Make Request Optional",
//      s"Optic expected to see a value for the request but instead saw nothing. If it is allowed to be omitted, make it Optional",
      commands,
      context,
      FrontEndMetadata(affectedIds = Seq(shapeDiff.expected.shapeId), changed = true)
    )
  }

  def ChangeShapeToOptional(requestDiffResult: UnmatchedResponseBodyShape, shapeDiff: UnsetValue,  context: InterpretationContext): DiffInterpretation = {
    val wrapperShapeId = ShapesHelper.newShapeId()
    val commands = Seq(
      AddShape(wrapperShapeId, OptionalKind.baseShapeId, ""),
      SetParameterShape(
        ProviderInShape(wrapperShapeId, ShapeProvider(shapeDiff.expected.shapeId), "$optionalInner")
      ),
      SetResponseBodyShape(requestDiffResult.responseId, ShapedBodyDescriptor(requestDiffResult.contentType, wrapperShapeId, isRemoved = false))
    )
    DiffInterpretation(
      "Make Response Optional",
//      s"Optic expected to see a value for the response but instead saw nothing. If it is allowed to be omitted, make it Optional",
      commands,
      context,
      FrontEndMetadata(affectedIds = Seq(shapeDiff.expected.shapeId), changed = true)
    )
  }
}
