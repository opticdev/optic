package com.useoptic.diff.interactions.interpretations

import com.useoptic.contexts.requests.Commands.{ShapedBodyDescriptor}
import com.useoptic.contexts.requests.{RequestsServiceHelper, Commands => RequestsCommands}
import com.useoptic.contexts.rfc.Commands.RfcCommand
import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.Commands.{FieldShapeFromShape, ProviderInShape, ShapeProvider}
import com.useoptic.contexts.shapes.ShapesHelper.{ListKind, ObjectKind}
import com.useoptic.contexts.shapes.{ShapesAggregate, ShapesHelper, Commands => ShapesCommands}
import com.useoptic.diff.InteractiveDiffInterpretation
import com.useoptic.diff.initial.ShapeBuilder
import com.useoptic.diff.interactions.{BodyUtilities, InteractionTrail, RequestSpecTrail, RequestSpecTrailHelpers}
import com.useoptic.diff.shapes.{JsonObjectKey, JsonTrail, ListItemTrail, ListTrail, ObjectFieldTrail, ObjectTrail, Resolvers, ShapeTrail}
import com.useoptic.types.capture.HttpInteraction

class BasicInterpretations(rfcState: RfcState) {
  def AddResponse(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail): InteractiveDiffInterpretation = {
    val requestId = RequestSpecTrailHelpers.requestId(requestsTrail).get

    val responseId = RequestsServiceHelper.newResponseId()
    val commands = Seq(
      RequestsCommands.AddResponse(responseId, requestId, interactionTrail.statusCode())
    )
    InteractiveDiffInterpretation(
      s"Add ${interactionTrail.statusCode()} Response",
      s"Include this response status code in the spec",
      commands
    )
  }

  def SetRequestBodyShape(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail, interaction: HttpInteraction): InteractiveDiffInterpretation = {
    val actualJson = BodyUtilities.parseJsonBody(interaction.request.body).get
    val shape = new ShapeBuilder(actualJson).run
    val inlineShapeId = shape.rootShapeId
    val wrapperId = ShapesHelper.newShapeId()
    val requestId = RequestSpecTrailHelpers.requestId(requestsTrail).get
    val contentType = interactionTrail.requestContentType()

    val commands = shape.commands ++ Seq(
      ShapesCommands.AddShape(wrapperId, inlineShapeId, ""),
      RequestsCommands.SetRequestBodyShape(requestId, ShapedBodyDescriptor(contentType, wrapperId, isRemoved = false))
    )

    InteractiveDiffInterpretation(
      "Add Request Body",
      "Include this request body in the spec",
      commands
    )
  }

  def SetResponseBodyShape(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail, interaction: HttpInteraction): InteractiveDiffInterpretation = {
    val actualJson = BodyUtilities.parseJsonBody(interaction.response.body).get
    val shape = new ShapeBuilder(actualJson).run
    val inlineShapeId = shape.rootShapeId
    val wrapperId = ShapesHelper.newShapeId()
    val responseId = RequestSpecTrailHelpers.responseId(requestsTrail).get
    val contentType = interactionTrail.responseContentType()

    val commands = shape.commands ++ Seq(
      ShapesCommands.AddShape(wrapperId, inlineShapeId, ""),
      RequestsCommands.SetResponseBodyShape(responseId, ShapedBodyDescriptor(contentType, wrapperId, isRemoved = false))
    )

    InteractiveDiffInterpretation(
      "Add Response Body",
      "Include this response body in the spec",
      commands
    )
  }

  //@GOTCHA: this is not a backwards-compatible change
  def ChangeResponseContentType(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail): InteractiveDiffInterpretation = {
    val responseId = RequestSpecTrailHelpers.responseId(requestsTrail).get
    val commands = Seq(
      RequestsCommands.SetResponseContentType(responseId, interactionTrail.responseContentType())
    )
    InteractiveDiffInterpretation(
      "Set Response Content-Type",
      "",
      commands
    )
  }

  //@GOTCHA: this is not a backwards-compatible change
  def ChangeRequestContentType(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail): InteractiveDiffInterpretation = {
    val requestId = RequestSpecTrailHelpers.requestId(requestsTrail).get
    val commands = Seq(
      RequestsCommands.SetRequestContentType(requestId, interactionTrail.requestContentType())
    )
    InteractiveDiffInterpretation(
      "Set Request Content-Type",
      "Change from ",
      commands
    )
  }

  def AddRequestContentType(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail) = {
    println(interactionTrail)
    println(requestsTrail)
    val requestId = RequestsServiceHelper.newRequestId()
    val emptyObjectShapeId = ShapesHelper.newShapeId()
    val originalRequestId = RequestSpecTrailHelpers.requestId(requestsTrail).get
    val originalRequest = rfcState.requestsState.requests(originalRequestId)
    val commands = Seq(
      RequestsCommands.AddRequest(requestId, originalRequest.requestDescriptor.pathComponentId, originalRequest.requestDescriptor.httpMethod),
      ShapesCommands.AddShape(emptyObjectShapeId, ObjectKind.baseShapeId, ""),
      //@BUG handle when interactionTrail.requestContentType() is not present (in which case we should just add a new request with no default body
      RequestsCommands.SetRequestBodyShape(requestId, ShapedBodyDescriptor(interactionTrail.requestContentType(), emptyObjectShapeId, isRemoved = false))
    )
    println("xxx")
    println(commands)
    InteractiveDiffInterpretation(
      "Add New Request",
      "Add new <request> with <content type> body",
      commands
    )
  }

  def AddResponseContentType(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail) = {
    val responseId = RequestsServiceHelper.newResponseId()
    val originalResponseId = RequestSpecTrailHelpers.responseId(requestsTrail).get
    val originalResponse = rfcState.requestsState.responses(originalResponseId)
    val emptyObjectShapeId = ShapesHelper.newShapeId()

    val commands = Seq(
      RequestsCommands.AddResponseByPathAndMethod(responseId, originalResponse.responseDescriptor.pathId, originalResponse.responseDescriptor.httpMethod, originalResponse.responseDescriptor.httpStatusCode),
      ShapesCommands.AddShape(emptyObjectShapeId, ObjectKind.baseShapeId, ""),
      //@BUG handle when interactionTrail.responseContentType() is not present (in which case we should just add a new response with no default body
      RequestsCommands.SetResponseBodyShape(responseId, ShapedBodyDescriptor(interactionTrail.responseContentType(), emptyObjectShapeId, isRemoved = false))
    )

    InteractiveDiffInterpretation(
      "Add New Response",
      "Add new <response> with <content type> body",
      commands
    )
  }

  //@GOTCHA: this is not a backwards-compatible change
  def ChangeShape(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail, shapeTrail: ShapeTrail, jsonTrail: JsonTrail, interaction: HttpInteraction): InteractiveDiffInterpretation = {
    val resolved = Resolvers.tryResolveJson(interactionTrail, jsonTrail, interaction)

    //@TODO: inject real shapesState? for now this will always create a new shape
    val builtShape = new ShapeBuilder(resolved.get)(ShapesAggregate.initialState).run

    val additionalCommands: Seq[RfcCommand] = shapeTrail.path.lastOption match {
      case Some(trailItem) => trailItem match {
        case t: ObjectTrail => Seq(
          ShapesCommands.SetBaseShape(t.shapeId, builtShape.rootShapeId)
        )
        case t: ObjectFieldTrail => Seq(
          ShapesCommands.SetFieldShape(FieldShapeFromShape(t.fieldId, builtShape.rootShapeId))
        )
        case t: ListTrail => Seq(
          ShapesCommands.SetBaseShape(t.shapeId, builtShape.rootShapeId)
        )
        case t: ListItemTrail => {
          Seq(
            ShapesCommands.SetParameterShape(ProviderInShape(t.listShapeId, ShapeProvider(builtShape.rootShapeId), ListKind.innerParam))
          )
        }
      }
      case None => Seq(
        ShapesCommands.SetBaseShape(shapeTrail.rootShapeId, builtShape.rootShapeId)
      )
    }
    val commands = builtShape.commands ++ additionalCommands

    InteractiveDiffInterpretation(
      "Change Shape",
      "<place in spec> to match the request <place in interaction> which is a <>",
      commands
    )
  }

  //@GOTCHA: this is not a backwards-compatible change
  def AddFieldToShape(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail, shapeTrail: ShapeTrail, jsonTrail: JsonTrail, interaction: HttpInteraction) = {
    val resolved = Resolvers.tryResolveJson(interactionTrail, jsonTrail, interaction)

    //@TODO: inject real shapesState? for now this will always create a new shape
    val builtShape = new ShapeBuilder(resolved.get)(ShapesAggregate.initialState).run
    val fieldId = ShapesHelper.newFieldId()
    val shapeId = shapeTrail.lastObject().get
    val fieldName = jsonTrail.path.last.asInstanceOf[JsonObjectKey].key
    val additionalCommands = Seq(
      ShapesCommands.AddField(fieldId, shapeId, fieldName, FieldShapeFromShape(fieldId, builtShape.rootShapeId))
    )
    val commands = builtShape.commands ++ additionalCommands
    InteractiveDiffInterpretation(
      "Add Field",
      "Add <fieldName> (<>) to <place in spec>> to match <place in interaction>",
      commands
    )
  }
}
