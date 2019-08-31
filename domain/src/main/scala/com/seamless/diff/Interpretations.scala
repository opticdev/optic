package com.seamless.diff

import com.seamless.contexts.requests.Commands
import com.seamless.contexts.requests.Commands.{SetResponseBodyShape, ShapedBodyDescriptor}
import com.seamless.contexts.requests.RequestsServiceHelper
import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.contexts.shapes.Commands.{AddField, FieldShapeFromShape, SetFieldShape}
import com.seamless.contexts.shapes.ShapesHelper
import com.seamless.diff.initial.ShapeBuilder
import io.circe.{Json, JsonObject}

import scala.scalajs.js.annotation.JSExportAll

@JSExportAll
case class DiffInterpretation(title: String,
                              description: String,
                              commands: Seq[RfcCommand],
                              metadata: Json = null,
                              example: Json = null)

object Interpretations {

  def AddRequest(method: String, pathId: String) = {
    val commands = Seq(
      Commands.AddRequest(RequestsServiceHelper.newRequestId(), pathId, method)
    )
    DiffInterpretation(
      "New Operation",
      s"Optic observed a ${method.toUpperCase} operation for this path",
      commands
    )
  }

  def AddResponse(statusCode: Int, requestId: String) = {
    val commands = Seq(
      Commands.AddResponse(RequestsServiceHelper.newResponseId(), requestId, statusCode)
    )
    DiffInterpretation(
      s"Added ${statusCode} Response",
      s"A ${statusCode} response was observed.",
      commands
    )
  }

  def ChangeResponseContentType(responseStatusCode: Int, responseId: String, newContentType: String, oldContentType: String) = {
    val commands = Seq(
      Commands.SetResponseContentType(responseId, newContentType)
    )

    DiffInterpretation(
      s"Response Content-Type Changed",
      s"The content type of your ${responseStatusCode} response was changed from\n<b>${oldContentType}</b> -> <b>${newContentType}</b>",
      commands
    )
  }


  def AddInitialBodyShape(actual: Json, responseStatusCode: Int, responseId: String, contentType: String) = {
    val shape = new ShapeBuilder(actual).run
    val inlineShapeId = shape.rootShapeId
    val commands = shape.commands ++ Seq (
      SetResponseBodyShape(responseId, ShapedBodyDescriptor(contentType, inlineShapeId, isRemoved = false))
    )

    DiffInterpretation(
      s"Response Body Observed",
      s"Optic observed a new response body for your ${responseStatusCode}.\nChoose a name and Optic will create a new concept in your specification.",
      commands,
      metadata = Json.fromJsonObject(JsonObject("shapeIdToName" -> Json.fromString(inlineShapeId))),
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
      commands
    )

  }

  def ChangeFieldShape(key: String, fieldId: String, newShapeId: String, responseStatusCode: Int) = {

    val commands = Seq(
      SetFieldShape(FieldShapeFromShape(fieldId, newShapeId))
    )

    DiffInterpretation(
      s"A Field was Added",
      //@todo change copy based on if it's a concept or not
      s"A new field '${key}' was observed in the ${responseStatusCode} response.",
      commands
    )

  }

}
