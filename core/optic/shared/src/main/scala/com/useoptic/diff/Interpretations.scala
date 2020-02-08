package com.useoptic.diff

import com.useoptic.contexts.requests.Commands.{RequestId, ResponseId, SetRequestBodyShape, SetResponseBodyShape, ShapedBodyDescriptor}
import com.useoptic.contexts.requests.{Commands, RequestsServiceHelper}
import com.useoptic.contexts.rfc.Commands.RfcCommand
import com.useoptic.contexts.shapes.Commands.{AddField, AddShape, FieldId, FieldShapeFromShape, RemoveField, SetFieldShape, ShapeId}
import com.useoptic.contexts.shapes.{ShapesHelper, ShapesState}
import com.useoptic.diff.initial.{ShapeBuilder, ShapeExample, ShapeResolver}
import io.circe.Json

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExportAll
case class DiffInterpretation(actionTitle: String,
                              description: DynamicDescription,
                              commands: Seq[RfcCommand],
                              context: InterpretationContext,
                              metadata: FrontEndMetadata = FrontEndMetadata())

@JSExportAll
case class DynamicDescription(template: String,
                              fieldId: Option[String] = None,
                              shapeId: Option[String] = None)

@JSExportAll
case class InterpretationContext(responseId: Option[String], inRequestBody: Boolean)

@JSExportAll
case class FrontEndMetadata(addedIds: Seq[String] = Seq.empty,
                            changedIds: Seq[String] = Seq.empty,
                            removedIds: Seq[String] = Seq.empty)

object Interpretations {

  def AddResponse(statusCode: Int, requestId: String): DiffInterpretation = {
    val id = RequestsServiceHelper.newResponseId()
    val commands = Seq(
      Commands.AddResponse(id, requestId, statusCode)
    )
    DiffInterpretation(
      s"Add ${statusCode} Response",
      DynamicDescription("Include this response in the spec"),
      commands,
      InterpretationContext(Some(id), false),
      FrontEndMetadata(addedIds = Seq(id))
    )
  }

  def ChangeRequestContentType(requestId: RequestId, newContentType: String, oldContentType: String)(implicit shapesState: ShapesState) = {
    val commands = Seq(
      Commands.SetRequestContentType(requestId, newContentType)
    )

    DiffInterpretation(
      s"Set Request Content-Type",
      DynamicDescription(s"Change from `${oldContentType}` to `${newContentType}`"),
      commands,
      InterpretationContext(None, true),
      FrontEndMetadata(changedIds = Seq(requestId, requestId + ".content_type"))
    )
  }

  def ChangeResponseContentType(responseStatusCode: Int, responseId: String, newContentType: String, oldContentType: String) = {
    val commands = Seq(
      Commands.SetResponseContentType(responseId, newContentType)
    )

    DiffInterpretation(
      s"Set Response Content-Type",
      DynamicDescription(s"Change from `${oldContentType}` to `${newContentType}`"),
      commands,
      InterpretationContext(Some(responseId), false),
      FrontEndMetadata(changedIds = Seq(responseId, responseId + ".content_type"))
    )
  }

  def AddInitialRequestBodyShape(actual: ShapeLikeJs, requestId: RequestId, contentType: String)(implicit shapesState: ShapesState) = {
    val actualJson = actual.json.get
    val shape = new ShapeBuilder(actualJson).run
    val inlineShapeId = shape.rootShapeId
    val wrapperId = ShapesHelper.newShapeId()

    val name = shapesState.concepts.collectFirst {
      case (id, concept) if id == inlineShapeId => concept.descriptor.name
    }

    val commands = shape.commands ++ Seq(
      AddShape(wrapperId, inlineShapeId, ""),
      SetRequestBodyShape(requestId, ShapedBodyDescriptor(contentType, wrapperId, isRemoved = false))
    )

    DiffInterpretation(
      s"Add Request Body",
      DynamicDescription(s"Add new shape to spec"),
      commands,
      InterpretationContext(None, true),
      FrontEndMetadata(addedIds = Seq(wrapperId))
    )
  }

  def AddFieldToRequestShape(key: String, raw: ShapeLikeJs, parentShapeId: String, requestId: RequestId)(implicit shapesState: ShapesState) = {
    val actualJson = raw.json.get
    val fieldId = ShapesHelper.newFieldId()

    val result = new ShapeBuilder(actualJson).run
    val commands = result.commands ++ Seq(AddField(fieldId, parentShapeId, key, FieldShapeFromShape(fieldId, result.rootShapeId)))

    val parentConcept = shapesState.concepts.collectFirst {
      case (id, concept) if id == parentShapeId => (id, concept.descriptor.name)
    }

    val affectedConcepts = if (parentConcept.isDefined) Seq(parentConcept.get._1) else Seq.empty

    DiffInterpretation(
      s"Add Field",
      DynamicDescription(s"`${key}` as `{{fieldId_SHAPE}}`", fieldId = Some(fieldId)),
      commands,
      InterpretationContext(None, true),
      FrontEndMetadata(addedIds = Seq(fieldId))
    )
  }

  def DeleteField(key: String, fieldId: FieldId, context: InterpretationContext)(implicit shapesState: ShapesState) = {

    val commands = Seq(RemoveField(fieldId))


    DiffInterpretation(
      s"Delete Field",
      DynamicDescription(s"Delete field `${key}`"),
      commands,
      context,
      FrontEndMetadata(removedIds = Seq(fieldId))
    )
  }

  def ChangeFieldInRequestShape(key: String, fieldId: FieldId, raw: ShapeLikeJs, requestId: RequestId)(implicit shapesState: ShapesState) = {
    val actualJson = raw.json.get
    val result = new ShapeBuilder(actualJson).run

    val commands = result.commands ++ Seq(
      SetFieldShape(FieldShapeFromShape(fieldId, result.rootShapeId))
    )

    DiffInterpretation(
      s"Update Field",
      DynamicDescription(s"Change `${key}` to `{{fieldId_SHAPE}}`", fieldId = Some(fieldId)),
      commands,
      InterpretationContext(None, true),
      FrontEndMetadata(changedIds = Seq(fieldId))
    )
  }

  def AddInitialResponseBodyShape(actual: ShapeLikeJs, responseStatusCode: Int, responseId: String, contentType: String)(implicit shapesState: ShapesState) = {
    val actualJson = actual.json.get

    val shape = new ShapeBuilder(actualJson).run
    val inlineShapeId = shape.rootShapeId
    val wrapperId = ShapesHelper.newShapeId()

    val commands = shape.commands ++ Seq(
      AddShape(wrapperId, inlineShapeId, ""),
      SetResponseBodyShape(responseId, ShapedBodyDescriptor(contentType, wrapperId, isRemoved = false))
    )

    DiffInterpretation(
      s"Add Response Body",
      DynamicDescription(s"Add new shape to spec"),
      commands,
      InterpretationContext(Some(responseId), false),
      FrontEndMetadata(addedIds = Seq(wrapperId))
    )
  }

  def AddFieldToResponseShape(key: String, raw: ShapeLikeJs, parentShapeId: String, responseStatusCode: Int, responseId: String)(implicit shapesState: ShapesState) = {
    val actualJson = raw.json.get
    val fieldId = ShapesHelper.newFieldId()

    val result = new ShapeBuilder(actualJson).run
    val commands = result.commands ++ Seq(AddField(fieldId, parentShapeId, key, FieldShapeFromShape(fieldId, result.rootShapeId)))

    val parentConcept = shapesState.concepts.collectFirst {
      case (id, concept) if id == parentShapeId => (id, concept.descriptor.name)
    }

    val affectedConcepts = if (parentConcept.isDefined) Seq(parentConcept.get._1) else Seq.empty

    DiffInterpretation(
      s"Add Field",
      DynamicDescription(s"`${key}` as `{{fieldId_SHAPE}}`", fieldId = Some(fieldId)),
      commands,
      InterpretationContext(Some(responseId), false),
      FrontEndMetadata(addedIds = Seq(fieldId))
    )
  }

  def ChangeFieldInResponseShape(key: String, fieldId: String, raw: ShapeLikeJs, responseStatusCode: Int, responseId: ResponseId)(implicit shapesState: ShapesState) = {
    val actualJson = raw.json.get
    val result = new ShapeBuilder(actualJson).run

    val commands = result.commands ++ Seq(
      SetFieldShape(FieldShapeFromShape(fieldId, result.rootShapeId))
    )

    DiffInterpretation(
      s"Update Field",
      //@todo change copy based on if it's a concept or not
      DynamicDescription(s"Change `${key}` to `{{fieldId_SHAPE}}`", fieldId = Some(fieldId)),
      commands,
      InterpretationContext(Some(responseId), false),
      FrontEndMetadata(addedIds = Seq(fieldId))
    )

  }

}
