package com.useoptic.diff.interactions.interpretations

import com.useoptic.contexts.requests.Commands.ShapedBodyDescriptor
import com.useoptic.contexts.requests.{RequestsServiceHelper, Commands => RequestsCommands}
import com.useoptic.contexts.rfc.Commands.RfcCommand
import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.Commands.{FieldShapeFromShape, ProviderInShape, ShapeProvider}
import com.useoptic.contexts.shapes.ShapesHelper.{ListKind, ObjectKind}
import com.useoptic.contexts.shapes.{ShapesAggregate, ShapesHelper, Commands => ShapesCommands}
import com.useoptic.diff.{ChangeType, InteractiveDiffInterpretation}
import com.useoptic.diff.initial.{DistributionAwareShapeBuilder, ShapeBuilder}
import com.useoptic.diff.interactions.interpreters.DiffDescriptionInterpreters
import com.useoptic.diff.interactions.{BodyUtilities, InteractionTrail, RequestSpecTrail, RequestSpecTrailHelpers}
import com.useoptic.diff.shapes.{JsonTrail, ListItemTrail, ListTrail, ObjectFieldTrail, ObjectTrail, OneOfItemTrail, Resolvers, ShapeTrail, UnknownTrail}
import com.useoptic.diff.shapes.JsonTrailPathComponent._
import com.useoptic.logging.Logger
import com.useoptic.types.capture.{HttpInteraction, JsonLikeFrom}

class BasicInterpretations(rfcState: RfcState) {

  private val descriptionInterpreters = new DiffDescriptionInterpreters(rfcState)

  def AddResponse(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail): InteractiveDiffInterpretation = {
    val requestId = RequestSpecTrailHelpers.requestId(requestsTrail).get

    val responseId = RequestsServiceHelper.newResponseId()
    val commands = Seq(
      RequestsCommands.AddResponse(responseId, requestId, interactionTrail.statusCode())
    )
    InteractiveDiffInterpretation(
      s"Add ${interactionTrail.statusCode()} Response with ${interactionTrail.responseBodyContentTypeOption().getOrElse("No")} Body",
      s"Added ${interactionTrail.statusCode()} Response with ${interactionTrail.responseBodyContentTypeOption().getOrElse("No")} Body",
      commands,
      ChangeType.Addition
    )
  }

  def SetRequestBodyShape(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail, interaction: HttpInteraction): InteractiveDiffInterpretation = {
    val actualJson = BodyUtilities.parseBody(interaction.request.body).get
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
      s"Add Request with ${interactionTrail.responseBodyContentTypeOption().getOrElse("No")} Body",
      s"Added Request with ${interactionTrail.responseBodyContentTypeOption().getOrElse("No")} Body",
      commands,
      ChangeType.Addition
    )
  }

  def SetResponseBodyShape(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail, interaction: HttpInteraction): InteractiveDiffInterpretation = {
    val actualJson = BodyUtilities.parseBody(interaction.response.body).get
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
      s"Add ${interactionTrail.statusCode()} Response with ${interactionTrail.responseBodyContentTypeOption().getOrElse("No")} Body",
      s"Added ${interactionTrail.statusCode()} Response with ${interactionTrail.responseBodyContentTypeOption().getOrElse("No")} Body",
      commands,
      ChangeType.Addition
    )
  }

  def AddRequestContentType(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail, interactions: Vector[HttpInteraction]): InteractiveDiffInterpretation = {
    val baseInteraction = interactions.head
    val requestId = RequestsServiceHelper.newRequestId()
    val pathId = RequestSpecTrailHelpers.pathId(requestsTrail).get
    val baseCommands = Seq(
      RequestsCommands.AddRequest(requestId, pathId, baseInteraction.request.method),
    )
    interactionTrail.requestBodyContentTypeOption() match {
      case Some(contentType) => {
        val jsonBody = Resolvers.tryResolveJsonLike(interactionTrail, JsonTrail(Seq()), baseInteraction)
        val actuallyHasBody = jsonBody.isDefined
        if (actuallyHasBody) {

          val (rootShapeId, buildCommands) = DistributionAwareShapeBuilder.toCommands(interactions.flatMap(i =>  BodyUtilities.parseBody(i.response.body)))

          val commands = baseCommands ++ buildCommands.flatten ++ Seq(
            RequestsCommands.SetRequestBodyShape(requestId, ShapedBodyDescriptor(contentType, rootShapeId, isRemoved = false))
          )

          InteractiveDiffInterpretation(
            s"Add Request with ${contentType} Body",
            s"Added Request with ${contentType} Body",
            commands,
            ChangeType.Addition
          )
        } else {
          val commands = baseCommands
          InteractiveDiffInterpretation(
            s"Add Request with ${contentType} Content-Type but no Body",
            s"Added Request with ${contentType} Content-Type but no Body",
            commands,
            ChangeType.Addition
          )
        }

      }
      case None => {
        val commands = baseCommands
        InteractiveDiffInterpretation(
          s"Add Request with No Body",
          s"Added Request with No Body",
          commands,
          ChangeType.Addition
        )
      }
    }
  }

  def AddResponseContentType(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail, interactions: Vector[HttpInteraction]) = {
    val baseInteraction = interactions.head
    val responseId = RequestsServiceHelper.newResponseId()
    val pathId = RequestSpecTrailHelpers.pathId(requestsTrail).get
    val baseCommands = Seq(
      RequestsCommands.AddResponseByPathAndMethod(responseId, pathId, baseInteraction.request.method, baseInteraction.response.statusCode),
    )
    interactionTrail.responseBodyContentTypeOption() match {
      case Some(contentType) => {
        val jsonBody = Resolvers.tryResolveJsonLike(interactionTrail, JsonTrail(Seq()), baseInteraction)
        val actuallyHasBody = jsonBody.isDefined
        if (actuallyHasBody) {

          val (rootShapeId, buildCommands) = DistributionAwareShapeBuilder.toCommands(interactions.flatMap(i =>  BodyUtilities.parseBody(i.response.body)))

          val commands = baseCommands ++ buildCommands.flatten ++ Seq(
            RequestsCommands.SetResponseBodyShape(responseId, ShapedBodyDescriptor(contentType, rootShapeId, isRemoved = false))
          )

          InteractiveDiffInterpretation(
            s"Add ${interactionTrail.statusCode()} Response with ${contentType} Body",
            s"Added ${interactionTrail.statusCode()} Response with ${contentType} Body",
            commands,
            ChangeType.Addition
          )
        } else {
          val commands = baseCommands

          InteractiveDiffInterpretation(
            s"Add ${interactionTrail.statusCode()} Response with ${contentType} Content-Type but no Body",
            s"Added ${interactionTrail.statusCode()} Response with ${contentType} Content-Type but no Body",
            commands,
            ChangeType.Addition
          )
        }
      }
      case None => {
        val commands = baseCommands
        InteractiveDiffInterpretation(
          s"Add ${interactionTrail.statusCode()} Response with No Body",
          s"Added ${interactionTrail.statusCode()} Response with No Body",
          commands,
          ChangeType.Addition
        )
      }
    }
  }

  //@GOTCHA: this is not a backwards-compatible change
  def ChangeShape(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail, shapeTrail: ShapeTrail, jsonTrail: JsonTrail, interaction: HttpInteraction): InteractiveDiffInterpretation = {
    val resolved = Resolvers.tryResolveJsonLike(interactionTrail, jsonTrail, interaction)

    //@TODO: inject real shapesState? for now this will always create a new shape
    val builtShape = new ShapeBuilder(resolved.get)(rfcState.shapesState).run


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
        case t: OneOfItemTrail => {
          Logger.log("sentinel-ChangeShape-OneOfItemTrail")
          Seq(
            ShapesCommands.SetParameterShape(ProviderInShape(t.oneOfId, ShapeProvider(builtShape.rootShapeId), t.parameterId))
          )
        }
      }
      case None => Seq(
        ShapesCommands.SetBaseShape(shapeTrail.rootShapeId, builtShape.rootShapeId)
      )
    }
    val commands = builtShape.commands ++ additionalCommands

    val toShape = Resolvers.jsonToCoreKind(resolved.get).name

    InteractiveDiffInterpretation(
      s"Change shape to ${toShape}",
      s"Changed the shape of ${descriptionInterpreters.jsonTrailDetailedDescription(jsonTrail)} ${descriptionInterpreters.shapeName(shapeTrail.rootShapeId)} to ${toShape}",
      commands,
      ChangeType.Update
    )
  }

  //@GOTCHA: this is not a backwards-compatible change
  def AddFieldToShape(interactionTrail: InteractionTrail, requestsTrail: RequestSpecTrail, shapeTrail: ShapeTrail, jsonTrail: JsonTrail, interaction: HttpInteraction) = {
    val resolved = Resolvers.tryResolveJsonLike(interactionTrail, jsonTrail, interaction)

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
      s"Add field '${fieldName}'",
      s"Added ${fieldName}",
      commands,
      ChangeType.Addition
    )
  }
}
