package com.useoptic.diff.interactions.interpretations

import com.useoptic.contexts.requests.Commands.ShapedBodyDescriptor
import com.useoptic.contexts.requests.{RequestsServiceHelper, Commands => RequestsCommands}
import com.useoptic.contexts.rfc.Commands.RfcCommand
import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.Commands.{FieldShapeFromShape, ProviderInShape, ShapeProvider}
import com.useoptic.contexts.shapes.ShapesHelper.{ListKind, ObjectKind}
import com.useoptic.contexts.shapes.{ShapesAggregate, ShapesHelper, Commands => ShapesCommands}
import com.useoptic.diff.{ChangeType, InteractiveDiffInterpretation}
import com.useoptic.diff.initial.ShapeBuilder
import com.useoptic.diff.interactions.{BodyUtilities, InteractionTrail, RequestSpecTrail, RequestSpecTrailHelpers}
import com.useoptic.diff.shapes.{JsonTrail, ListItemTrail, ListTrail, ObjectFieldTrail, ObjectTrail, Resolvers, ShapeTrail}
import com.useoptic.diff.shapes.JsonTrailPathComponent._
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
      s"Include status code in specification",
      commands,
      ChangeType.Addition
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
      s"Include a ${interactionTrail.requestContentType()} body",
      commands,
      ChangeType.Addition
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
      s"Include a ${interactionTrail.responseContentType()} body",
      commands,
      ChangeType.Addition
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
      commands,
      ChangeType.Update
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
      commands,
      ChangeType.Update
    )
  }

  def AddRequestContentType(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail, interaction: HttpInteraction): InteractiveDiffInterpretation = {
    println(interactionTrail)
    println(requestsTrail)
    val requestId = RequestsServiceHelper.newRequestId()
    val originalRequestId = RequestSpecTrailHelpers.requestId(requestsTrail).get
    val originalRequest = rfcState.requestsState.requests(originalRequestId)
    val jsonBody = Resolvers.tryResolveJson(interactionTrail, JsonTrail(Seq()), interaction)
    println(jsonBody)
    val builtShape = new ShapeBuilder(jsonBody.get).run
    val commands = Seq(
      RequestsCommands.AddRequest(requestId, originalRequest.requestDescriptor.pathComponentId, originalRequest.requestDescriptor.httpMethod),
    ) ++ builtShape.commands ++ Seq(
      //@BUG handle when interactionTrail.requestContentType() is not present (in which case we should just add a new request with no default body
      RequestsCommands.SetRequestBodyShape(requestId, ShapedBodyDescriptor(interactionTrail.requestContentType(), builtShape.rootShapeId, isRemoved = false))
    )

    InteractiveDiffInterpretation(
      s"Add ${interactionTrail.requestContentType()}",
      "Add new body content-type",
      commands,
      ChangeType.Addition
    )
  }

  def AddResponseContentType(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail, interaction: HttpInteraction) = {
    val responseId = RequestsServiceHelper.newResponseId()
    val originalResponseId = RequestSpecTrailHelpers.responseId(requestsTrail).get
    val originalResponse = rfcState.requestsState.responses(originalResponseId)
    val jsonBody = Resolvers.tryResolveJson(interactionTrail, JsonTrail(Seq()), interaction)
    println(jsonBody)
    val builtShape = new ShapeBuilder(jsonBody.get).run
    val commands = Seq(
      RequestsCommands.AddResponseByPathAndMethod(responseId, originalResponse.responseDescriptor.pathId, originalResponse.responseDescriptor.httpMethod, originalResponse.responseDescriptor.httpStatusCode),
    ) ++ builtShape.commands ++ Seq(
      //@BUG handle when interactionTrail.responseContentType() is not present (in which case we should just add a new response with no default body
      RequestsCommands.SetResponseBodyShape(responseId, ShapedBodyDescriptor(interactionTrail.responseContentType(), builtShape.rootShapeId, isRemoved = false))
    )

    InteractiveDiffInterpretation(
      s"Add ${interactionTrail.responseContentType()}",
      "Add new body content-type",
      commands,
      ChangeType.Addition
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
      "Change to a <shape>",
      "Change from <old-type> to <new-type>",
      commands,
      ChangeType.Update
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
      s"Add Field <fieldName>",
      "Add <fieldName> as <shape-type>",
      commands,
      ChangeType.Addition
    )
  }
}
