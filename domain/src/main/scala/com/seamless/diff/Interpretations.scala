package com.seamless.diff

import com.seamless.contexts.requests.Commands
import com.seamless.contexts.requests.Commands.{SetResponseBodyShape, ShapedBodyDescriptor}
import com.seamless.contexts.requests.RequestsServiceHelper
import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.contexts.shapes.Commands.{AddField, FieldShapeFromShape, SetFieldShape}
import com.seamless.contexts.shapes.{ShapesHelper, ShapesState}
import com.seamless.diff.initial.{NameShapeRequest, ShapeBuilder}
import io.circe.{Json, JsonObject}

import scala.scalajs.js.annotation.JSExportAll

@JSExportAll
case class DiffInterpretation(title: String,
                              description: String,
                              commands: Seq[RfcCommand],
                              affectedIds: Seq[String],
                              nameRequests: Seq[NameShapeRequest] = Seq.empty,
                              example: Json = null) {
  def exampleJs = {
    import io.circe.scalajs.convertJsonToJs
    if (example != null) convertJsonToJs(example) else null
  }
}

object Interpretations {

  def AddRequest(method: String, pathId: String) = {
    val id = RequestsServiceHelper.newRequestId()
    val commands = Seq(
      Commands.AddRequest(id, pathId, method)
    )
    DiffInterpretation(
      "New Operation",
      s"Optic observed a ${method.toUpperCase} operation for this path",
      commands,
      affectedIds = Seq(id)
    )
  }

  def AddResponse(statusCode: Int, requestId: String) = {
    val id = RequestsServiceHelper.newResponseId()
    val commands = Seq(
      Commands.AddResponse(id, requestId, statusCode)
    )
    DiffInterpretation(
      s"New Response",
      s"A ${statusCode} response was observed.",
      commands,
      affectedIds = Seq(id)
    )
  }

  def ChangeResponseContentType(responseStatusCode: Int, responseId: String, newContentType: String, oldContentType: String) = {
    val commands = Seq(
      Commands.SetResponseContentType(responseId, newContentType)
    )

    DiffInterpretation(
      s"Response Content-Type Changed",
      s"The content type of the ${responseStatusCode} response was changed from\n<b>${oldContentType}</b> -> <b>${newContentType}</b>",
      commands,
      affectedIds = Seq(responseId, responseId+".content_type")
    )
  }


  def AddInitialBodyShape(actual: Json, responseStatusCode: Int, responseId: String, contentType: String)(implicit shapesState: ShapesState) = {
    val shape = new ShapeBuilder(actual).run
    val inlineShapeId = shape.rootShapeId
    val commands = shape.commands ++ Seq (
      SetResponseBodyShape(responseId, ShapedBodyDescriptor(contentType, inlineShapeId, isRemoved = false))
    )

    DiffInterpretation(
      s"Response Body Observed",
      s"Optic observed a response body for the ${responseStatusCode} response.",
      commands,
      affectedIds = Seq(inlineShapeId),
      shape.nameRequests,
      example = actual
    )
  }

  def AddFieldToShape(key: String, parentShapeId: String, responseStatusCode: Int, responseId: String) = {
    val fieldId = ShapesHelper.newFieldId()
    val commands = Seq(AddField(fieldId, parentShapeId, key, FieldShapeFromShape(fieldId, "$string")))

    DiffInterpretation(
      s"A Field was Added",
      //@todo change copy based on if it's a concept or not
      s"A new field '${key}' was observed in the ${responseStatusCode} response.",
      commands,
      affectedIds = Seq(fieldId)
    )

  }

  def ChangeFieldShape(key: String, fieldId: String, newShapeId: String, responseStatusCode: Int) = {

    val commands = Seq(
      SetFieldShape(FieldShapeFromShape(fieldId, newShapeId))
    )

    DiffInterpretation(
      s"A field's type was changed",
      //@todo change copy based on if it's a concept or not
      s"The type of '${key}' was changed in the ${responseStatusCode} response.",
      commands,
      affectedIds = Seq(fieldId)
    )

  }

}
