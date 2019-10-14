package com.seamless.diff

import com.seamless.contexts.requests.Commands.{RequestId, SetRequestBodyShape, SetResponseBodyShape, ShapedBodyDescriptor}
import com.seamless.contexts.requests.{Commands, RequestsServiceHelper}
import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.contexts.shapes.Commands.{AddField, AddShape, FieldId, FieldShapeFromShape, SetFieldShape, ShapeId}
import com.seamless.contexts.shapes.{ShapesHelper, ShapesState}
import com.seamless.diff.initial.{ShapeBuilder, ShapeExample, ShapeResolver}
import io.circe.Json

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSExport, JSExportAll}
import scala.util.Try

@JSExportAll
case class DiffInterpretation(actionTitle: String,
                              commands: Seq[RfcCommand],
                              metadata: FrontEndMetadata = FrontEndMetadata()) {
  def metadataJs = metadata.asJs
}

case class FrontEndMetadata(affectedIds: Seq[String] = Seq.empty,
                            examples: Seq[ShapeExample] = Seq.empty,
                            example: Option[Json] = None,
                            added: Boolean = false,
                            changed: Boolean = false,
                            highlightNestedShape: Option[HighlightNestedShape] = None,
                            affectedConceptIds: Seq[String] = Seq.empty) {

  def asJs: js.Any = {
    import io.circe.scalajs.convertJsonToJs
    import io.circe.generic.auto._
    import io.circe.syntax._
    convertJsonToJs(this.asJson)
  }
}

sealed trait HighlightNestedShape
case class HighlightNestedResponseShape(statusCode: Int, parentShape: ShapeId) extends HighlightNestedShape
case class HighlightNestedRequestShape(parentShape: ShapeId) extends HighlightNestedShape

object Interpretations {

  def AddRequest(method: String, pathId: String) = {
    val id = RequestsServiceHelper.newRequestId()
    val commands = Seq(
      Commands.AddRequest(id, pathId, method)
    )
    DiffInterpretation(
      s"Add ${method.toUpperCase} Request",
//      s"Optic observed a ${method.toUpperCase} operation for this path",
      commands,
      FrontEndMetadata(affectedIds = Seq(id), added = true)
    )
  }

  def AddResponse(statusCode: Int, requestId: String) = {
    val id = RequestsServiceHelper.newResponseId()
    val commands = Seq(
      Commands.AddResponse(id, requestId, statusCode)
    )
    DiffInterpretation(
      s"Add ${statusCode} Response",
//      s"A ${statusCode} response was observed.",
      commands,
      FrontEndMetadata(affectedIds = Seq(id), added = true)
    )
  }

  //@todo check on this
  def RequireManualIntervention(message: String, affectedIds: Seq[String]) = {
    DiffInterpretation(
      "Continue",
//      message,
      Seq.empty,
      FrontEndMetadata(affectedIds = affectedIds)
    )
  }

  def ChangeRequestContentType(requestId: RequestId, newContentType: String, oldContentType: String)(implicit shapesState: ShapesState) = {
    val commands = Seq(
      Commands.SetRequestContentType(requestId, newContentType)
    )

    DiffInterpretation(
      s"Set Request Content-Type to ${newContentType}",
//      s"The content type of the request was changed from\n<b>${oldContentType}</b> -> <b>${newContentType}</b>",
      commands,
      FrontEndMetadata(affectedIds = Seq(requestId, requestId + ".content_type"))
    )
  }

  def ChangeResponseContentType(responseStatusCode: Int, responseId: String, newContentType: String, oldContentType: String) = {
    val commands = Seq(
      Commands.SetResponseContentType(responseId, newContentType)
    )

    DiffInterpretation(
      s"Set ${responseStatusCode} Response Content-Type to ${newContentType}",
//      s"The content type of the ${responseStatusCode} response was changed from\n<b>${oldContentType}</b> -> <b>${newContentType}</b>",
      commands,
      FrontEndMetadata(affectedIds = Seq(responseId, responseId + ".content_type"))
    )
  }

  def AddInitialRequestBodyShape(actual: Json, requestId: RequestId, contentType: String)(implicit shapesState: ShapesState) = {
    val shape = new ShapeBuilder(actual).run
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
//      desc,
      commands,
      FrontEndMetadata(affectedIds = Seq(wrapperId), examples = shape.examples, example = Some(actual), added = true)
    )
  }

  def AddFieldToRequestShape(key: String, raw: Json, parentShapeId: String, requestId: RequestId)(implicit shapesState: ShapesState) = {
    val fieldId = ShapesHelper.newFieldId()

    val result = new ShapeBuilder(raw).run
    val commands = result.commands ++ Seq(AddField(fieldId, parentShapeId, key, FieldShapeFromShape(fieldId, result.rootShapeId)))

    val parentConcept = shapesState.concepts.collectFirst {
      case (id, concept) if id == parentShapeId => (id, concept.descriptor.name)
    }

    val affectedConcepts = if (parentConcept.isDefined) Seq(parentConcept.get._1) else Seq.empty

    val highlight = HighlightNestedRequestShape(parentShapeId)

    DiffInterpretation(
      s"Add <b>${key}</b>",
      //@todo change copy based on if it's a concept or not
//      desc,
      commands,
      FrontEndMetadata(affectedIds = Seq(fieldId), affectedConceptIds = affectedConcepts :+ parentShapeId, added = true, highlightNestedShape = Some(highlight))
    )
  }

  def ChangeFieldInRequestShape(key: String, fieldId: FieldId, raw: Json, requestId: RequestId)(implicit shapesState: ShapesState) = {
    val result = new ShapeBuilder(raw).run

    val commands = result.commands ++ Seq(
      SetFieldShape(FieldShapeFromShape(fieldId, result.rootShapeId))
    )

    val highlightOption = Try(shapesState.flattenedField(fieldId).fieldShapeDescriptor.asInstanceOf[FieldShapeFromShape].shapeId).map(i => {
      HighlightNestedRequestShape(i)
    }).toOption

    DiffInterpretation(
      s"Change <b>${key}</b> shape",
      //@todo change copy based on if it's a concept or not
//      s"The type of '${key}' was changed in the request.",
      commands,
      FrontEndMetadata(affectedIds = Seq(fieldId), highlightNestedShape = highlightOption)
    )
  }

  def AddInitialResponseBodyShape(actual: Json, responseStatusCode: Int, responseId: String, contentType: String)(implicit shapesState: ShapesState) = {
    val shape = new ShapeBuilder(actual).run
    val inlineShapeId = shape.rootShapeId
    val wrapperId = ShapesHelper.newShapeId()

    val name = shapesState.concepts.collectFirst {
      case (id, concept) if id == inlineShapeId => concept.descriptor.name
    }

    val commands = shape.commands ++ Seq(
      AddShape(wrapperId, inlineShapeId, ""),
      SetResponseBodyShape(responseId, ShapedBodyDescriptor(contentType, wrapperId, isRemoved = false))
    )

    DiffInterpretation(
      s"Add Response Body",
//      desc,
      commands,
      FrontEndMetadata(affectedIds = Seq(wrapperId), examples = shape.examples, example = Some(actual), added = true)
    )
  }

  def AddFieldToResponseShape(key: String, raw: Json, parentShapeId: String, responseStatusCode: Int, responseId: String)(implicit shapesState: ShapesState) = {
    val fieldId = ShapesHelper.newFieldId()



    val result = new ShapeBuilder(raw).run
    val commands = result.commands ++ Seq(AddField(fieldId, parentShapeId, key, FieldShapeFromShape(fieldId, result.rootShapeId)))

    val parentConcept = shapesState.concepts.collectFirst {
      case (id, concept) if id == parentShapeId => (id, concept.descriptor.name)
    }

    val affectedConcepts = if (parentConcept.isDefined) Seq(parentConcept.get._1) else Seq.empty

    val highlight = HighlightNestedResponseShape(responseStatusCode, parentShapeId)

    DiffInterpretation(
      s"Add ${key}",
//      desc,
      commands,
      FrontEndMetadata(affectedIds = Seq(fieldId), affectedConceptIds = affectedConcepts :+ parentShapeId, added = true, highlightNestedShape = Some(highlight))
    )

  }

  def ChangeFieldInResponseShape(key: String, fieldId: String, raw: Json, responseStatusCode: Int)(implicit shapesState: ShapesState) = {
    val result = new ShapeBuilder(raw).run

    val highlightOption = Try(shapesState.flattenedField(fieldId).fieldShapeDescriptor.asInstanceOf[FieldShapeFromShape].shapeId).map(i => {
      HighlightNestedResponseShape(responseStatusCode, i)
    }).toOption

    val commands = result.commands ++ Seq(
      SetFieldShape(FieldShapeFromShape(fieldId, result.rootShapeId))
    )

    DiffInterpretation(
      s"Change <b>${key}</b> shape",
      //@todo change copy based on if it's a concept or not
//      s"The type of '${key}' was changed.",
      commands,
      FrontEndMetadata(affectedIds = Seq(fieldId), highlightNestedShape = highlightOption)
    )

  }

}
