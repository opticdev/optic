package com.useoptic.diff.interactions.interpreters

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.Commands.{FieldId, ShapeId}
import com.useoptic.contexts.shapes.projections.TrailTags
import com.useoptic.diff.ChangeType
import com.useoptic.diff.ChangeType.ChangeType
import com.useoptic.diff.interactions.{ContentTypeHelpers, InteractionDiffResult, InteractionTrail, UnmatchedRequestBodyContentType, UnmatchedRequestBodyShape, UnmatchedRequestMethod, UnmatchedRequestUrl, UnmatchedResponseBodyContentType, UnmatchedResponseBodyShape, UnmatchedResponseStatusCode}
import com.useoptic.diff.shapes.{JsonTrail, ListItemTrail, ListTrail, ObjectFieldTrail, ObjectTrail, Resolvers, ShapeDiffResult, ShapeTrail, UnmatchedShape, UnspecifiedShape}
import com.useoptic.diff.shapes.JsonTrailPathComponent._
import com.useoptic.types.capture.HttpInteraction

import scala.scalajs.js.annotation.{JSExport, JSExportAll}


sealed trait InteractionPointerDescription {
  def exampleTags: TrailTags[JsonTrail]
  def shapeTags: TrailTags[ShapeTrail]
  def changeType: ChangeType
}

case class Unspecified(jsonTrail: JsonTrail) extends InteractionPointerDescription {
  def changeType: ChangeType = ChangeType.Addition
  override def exampleTags: TrailTags[JsonTrail] = TrailTags(Map(
    jsonTrail -> changeType
  ))
  //always empty since not in the spec. might make sense to add 'specParent' so we can show the right part of the spec at least.
  override def shapeTags: TrailTags[ShapeTrail] = TrailTags(Map.empty)
}

case class SpecifiedButNotMatching(jsonTrail: JsonTrail, shapeTrail: ShapeTrail) extends InteractionPointerDescription {
  def changeType: ChangeType = ChangeType.Update
  override def exampleTags: TrailTags[JsonTrail] = TrailTags(Map(
    jsonTrail -> changeType
  ))
  override def shapeTags: TrailTags[ShapeTrail] = TrailTags(Map(
    shapeTrail -> changeType
  ))
}

case class SpecifiedButNotFound(jsonTrail: JsonTrail, shapeTrail: ShapeTrail) extends InteractionPointerDescription {
  def changeType: ChangeType = ChangeType.Removal
  override def exampleTags: TrailTags[JsonTrail] = TrailTags(Map(
    jsonTrail -> changeType
  ))
  override def shapeTags: TrailTags[ShapeTrail] = TrailTags(Map(
    shapeTrail -> changeType
  ))
}

@JSExportAll
case class DiffDescription(title: String, interactionPointerDescription: Option[InteractionPointerDescription], changeType: ChangeType) {
  def exampleTags: TrailTags[JsonTrail] = interactionPointerDescription.map(_.exampleTags).getOrElse(TrailTags.empty)
  def shapeTags: TrailTags[ShapeTrail] = interactionPointerDescription.map(_.shapeTags).getOrElse(TrailTags.empty)
  def changeTypeAsString: String = changeType.toString
}

@JSExport
@JSExportAll
class DiffDescriptionInterpreters(rfcState: RfcState) {
  def interpret(diff: ShapeDiffResult, interactionTrail: InteractionTrail, interaction: HttpInteraction): (String, InteractionPointerDescription) = {
    def shapeName(shapeId: ShapeId): String = {
      val shape = rfcState.shapesState.shapes(shapeId)
      val name = shape.descriptor.name
      if (name.nonEmpty) {
        name
      } else {
        shapeName(shape.descriptor.baseShapeId)
      }
    }

    def fieldName(fieldId: FieldId) = {
      rfcState.shapesState.fields(fieldId).descriptor.name
    }

    def expectedShapeDescription(shapeTrail: ShapeTrail) = shapeTrail.path.lastOption match {
      case Some(value) => value match {
        case ObjectTrail(shapeId) => shapeName(shapeId)
        case ObjectFieldTrail(fieldId, fieldShapeId) => shapeName(fieldShapeId)
        case ListTrail(shapeId) => shapeName(shapeId)
        case ListItemTrail(listShapeId, itemShapeId) => shapeName(itemShapeId)
      }
      case None => shapeName(shapeTrail.rootShapeId)
    }

    def jsonTrailDescription(jsonTrail: JsonTrail) = jsonTrail.path.lastOption match {
      case Some(value) => value match {
        case JsonObjectKey(key) => s"shape at key ${key}"
        case JsonArrayItem(index) => s"shape at index ${index}"
        case _ => "shape?"
      }
      case None => "shape"
    }

    diff match {
      case UnspecifiedShape(jsonTrail, shapeTrail) => {
        val title = s"The ${jsonTrailDescription(jsonTrail)} was not expected"
        val pointer = Unspecified(jsonTrail)
        (title, pointer)
      }
      case UnmatchedShape(jsonTrail, shapeTrail) => {
        val shapeDescription = expectedShapeDescription(shapeTrail)
        val title = s"The ${jsonTrailDescription(jsonTrail)} was not a ${shapeDescription}"

        val bodyOption = Resolvers.tryResolveJson(interactionTrail, jsonTrail, interaction)

        if (bodyOption.isEmpty) {
          val title = s"The ${jsonTrailDescription(jsonTrail)} was missing"
          val pointer = SpecifiedButNotFound(jsonTrail, shapeTrail)
          (title, pointer)
        } else {
          val title = s"The ${jsonTrailDescription(jsonTrail)} was not a ${shapeDescription}"
          val pointer = SpecifiedButNotMatching(jsonTrail, shapeTrail)
          (title, pointer)
        }
      }
    }
  }

  def interpret(diff: InteractionDiffResult, interaction: HttpInteraction): DiffDescription = {
    diff match {
      case d: UnmatchedRequestUrl => {
        DiffDescription(s"${interaction.request.method} ${interaction.request.path} is not documented in the spec", None, ChangeType.Addition)
      }
      case d: UnmatchedRequestMethod => {
        DiffDescription(s"${interaction.request.method} ${interaction.request.path} is not documented in the spec", None, ChangeType.Addition)
      }
      case d: UnmatchedRequestBodyContentType => {
        ContentTypeHelpers.contentType(interaction.request) match {
          case Some(contentTypeHeader) => DiffDescription(s"The ${contentTypeHeader} content type is not documented in the spec", None, ChangeType.Addition)
          case None => DiffDescription("A request with no body is not documented in the spec", None, ChangeType.Addition)
        }
      }
      case d: UnmatchedRequestBodyShape => {
        val (shapeDiffDescription, pointerDescription) = interpret(d.shapeDiffResult, d.interactionTrail, interaction)
        val title = s"${shapeDiffDescription}"
        DiffDescription(title, Some(pointerDescription), pointerDescription.changeType)
      }
      case d: UnmatchedResponseStatusCode => {
        DiffDescription(s"The ${interaction.response.statusCode} status code is not documented in the spec", None, ChangeType.Addition)
      }
      case d: UnmatchedResponseBodyContentType => {
        ContentTypeHelpers.contentType(interaction.response) match {
          case Some(contentTypeHeader) => DiffDescription(s"The ${contentTypeHeader} content type is not documented in the spec", None, ChangeType.Addition)
          case None => DiffDescription("A response with no body is not documented in the spec", None, ChangeType.Addition)
        }
      }
      case d: UnmatchedResponseBodyShape => {
        val (shapeDiffDescription, pointerDescription) = interpret(d.shapeDiffResult, d.interactionTrail, interaction)
        val title = s"${shapeDiffDescription}"
        DiffDescription(title, Some(pointerDescription), pointerDescription.changeType)
      }
    }
  }
}
