package com.useoptic.diff.interactions.interpreters

import com.useoptic.contexts.rfc.RfcState
import com.useoptic.contexts.shapes.Commands.{FieldId, ShapeId}
import com.useoptic.contexts.shapes.projections.TrailTags
import com.useoptic.diff.{ChangeType, DiffResult}
import com.useoptic.diff.ChangeType.ChangeType
import com.useoptic.diff.interactions.{ContentTypeHelpers, InteractionDiffResult, InteractionTrail, UnmatchedRequestBodyContentType, UnmatchedRequestBodyShape, UnmatchedRequestMethod, UnmatchedRequestUrl, UnmatchedResponseBodyContentType, UnmatchedResponseBodyShape, UnmatchedResponseStatusCode}
import com.useoptic.diff.shapes.{JsonTrail, ListItemTrail, ListTrail, ObjectFieldTrail, ObjectTrail, OneOfItemTrail, NullableTrail, NullableItemTrail, Resolvers, ShapeDiffResult, ShapeTrail, UnknownTrail, UnmatchedShape, UnspecifiedShape}
import com.useoptic.diff.shapes.JsonTrailPathComponent._
import com.useoptic.types.capture.HttpInteraction

import scala.scalajs.js.annotation.{JSExport, JSExportAll}


sealed trait InteractionPointerDescription {
  def changeType: ChangeType
  def assertion: String
  def summary: String
  def path: Seq[String]
}

case class Unspecified(jsonTrail: JsonTrail, assertion: String, summary: String, path: Seq[String]) extends InteractionPointerDescription {
  def changeType: ChangeType = ChangeType.Addition
}

case class SpecifiedButNotMatching(jsonTrail: JsonTrail, shapeTrail: ShapeTrail, assertion: String, summary: String, path: Seq[String]) extends InteractionPointerDescription {
  def changeType: ChangeType = ChangeType.Update
}

case class SpecifiedButNotFound(jsonTrail: JsonTrail, shapeTrail: ShapeTrail, assertion: String, summary: String, path: Seq[String]) extends InteractionPointerDescription {
  def changeType: ChangeType = ChangeType.Removal
}

@JSExportAll
case class DiffDescription(title: String, assertion: String, interactionPointerDescription: Option[InteractionPointerDescription], changeType: ChangeType) {
  def changeTypeAsString: String = changeType.toString
  def summary: String = interactionPointerDescription.map(_.summary).getOrElse("")
  def path: Seq[String] = interactionPointerDescription.map(_.path).getOrElse(Seq.empty)
}

@JSExport
@JSExportAll
class DiffDescriptionInterpreters(rfcState: RfcState) {
  def interpret(diff: ShapeDiffResult, inRequest: Boolean, interactionTrail: InteractionTrail, interaction: HttpInteraction): (String, InteractionPointerDescription) = {

    val inLocation = (if (inRequest) "Request" else s"${interactionTrail.statusCode()} Response") + " body"

    diff match {
      case UnspecifiedShape(jsonTrail, shapeTrail) => {
        val title = s"${jsonTrailDescription(jsonTrail)} observed in the ${inLocation}".capitalize
        val pointer = Unspecified(jsonTrail, jsonTrailAssertion(jsonTrail), s"New ${jsonTrailDetailedDescription(jsonTrail)}", jsonTrailPathDescription(jsonTrail))
        (title, pointer)
      }
      case UnmatchedShape(jsonTrail, shapeTrail) => {
        val shapeDescription = expectedShapeDescription(shapeTrail)

        val bodyOption = Resolvers.tryResolveJson(interactionTrail, jsonTrail, interaction)

        if (bodyOption.isEmpty) {
          val title = s"${jsonTrailDescription(jsonTrail)} in the ${inLocation} is missing"
          val pointer = SpecifiedButNotFound(jsonTrail, shapeTrail, s"required field is missing", s"Missing required ${jsonTrailDetailedDescription(jsonTrail)}",jsonTrailPathDescription(jsonTrail))
          (title, pointer)
        } else {
          val title = s"${jsonTrailDescription(jsonTrail)} in the ${inLocation} was not a ${shapeDescription}"
          val pointer = SpecifiedButNotMatching(jsonTrail, shapeTrail, s"expected a ${shapeDescription}", s"Expected ${jsonTrailDetailedDescription(jsonTrail)} to be ${shapeDescription}", jsonTrailPathDescription((jsonTrail)))
          (title, pointer)
        }
      }
    }
  }

  def interpret(diff: InteractionDiffResult, interaction: HttpInteraction): DiffDescription = {
    diff match {
      case d: UnmatchedRequestUrl => {
        DiffDescription("Undocumented URL", s"${interaction.request.method} ${interaction.request.path} is not documented in the spec", None, ChangeType.Addition)
      }
      case d: UnmatchedRequestMethod => {
        DiffDescription("Undocumented Method", s"${interaction.request.method} ${interaction.request.path} is not documented in the spec", None, ChangeType.Addition)
      }
      case d: UnmatchedRequestBodyContentType => {
        ContentTypeHelpers.contentType(interaction.request) match {
          case Some(contentTypeHeader) => DiffDescription("Undocumented Body", s"The ${contentTypeHeader} content type is not documented in the spec", None, ChangeType.Addition)
          case None => DiffDescription("Undocumented Body", "A request with no body is not documented in the spec", None, ChangeType.Addition)
        }
      }
      case d: UnmatchedRequestBodyShape => {
        val (shapeDiffDescription, pointerDescription) = interpret(d.shapeDiffResult, inRequest=true, d.interactionTrail, interaction)
        val title = s"${shapeDiffDescription}"
        DiffDescription(title, pointerDescription.assertion, Some(pointerDescription), pointerDescription.changeType)
      }
      case d: UnmatchedResponseStatusCode => {
        DiffDescription("Undocumented Status Code", s"The ${interaction.response.statusCode} status code is not documented in the spec", None, ChangeType.Addition)
      }
      case d: UnmatchedResponseBodyContentType => {
        ContentTypeHelpers.contentType(interaction.response) match {
          case Some(contentTypeHeader) => DiffDescription("Undocumented Body", s"The ${contentTypeHeader} content type is not documented in the spec", None, ChangeType.Addition)
          case None => DiffDescription("Undocumented Body", "A response with no body is not documented in the spec", None, ChangeType.Addition)
        }
      }
      case d: UnmatchedResponseBodyShape => {
        val (shapeDiffDescription, pointerDescription) = interpret(d.shapeDiffResult, inRequest=false,  d.interactionTrail, interaction)
        val title = s"${shapeDiffDescription}"
        DiffDescription(title, pointerDescription.assertion, Some(pointerDescription), pointerDescription.changeType)
      }
    }
  }

  def shapeName(shapeId: ShapeId): String = {
    val shape = rfcState.shapesState.shapes(shapeId)
    val name = shape.descriptor.name
    if (name.nonEmpty) {
      name
    } else {
      shapeName(shape.descriptor.baseShapeId)
    }
  }

  def expectedShapeDescription(shapeTrail: ShapeTrail) = shapeTrail.path.lastOption match {
    case Some(value) => value match {
      case t: ObjectTrail => shapeName(t.shapeId)
      case t: ObjectFieldTrail => shapeName(t.fieldShapeId)
      case t: ListTrail => shapeName(t.shapeId)
      case t: ListItemTrail => shapeName(t.itemShapeId)
      case t: OneOfItemTrail => shapeName(t.itemShapeId)
      case t: NullableTrail => "nullable shape?"
      case t: NullableItemTrail => shapeName(t.innerShapeId)
      //case UnknownTrail() => "unknown?"
    }
    case None => shapeName(shapeTrail.rootShapeId)
  }

  def jsonTrailDescription(jsonTrail: JsonTrail) = jsonTrail.path.lastOption match {
    case Some(value) => value match {
      case JsonObjectKey(key) => s"'${key}'"
      case JsonArrayItem(index) => s"shape at index ${index}"
      case _ => "shape?"
    }
    case None => "shape"
  }

  def jsonTrailDetailedDescription(jsonTrail: JsonTrail) = jsonTrail.path.lastOption match {
    case Some(value) => value match {
      case JsonObjectKey(key) => s"field '${key}'"
      case JsonArrayItem(index) => s"shape at index ${index}"
      case _ => "shape?"
    }
    case None => "shape"
  }

  def jsonTrailPathDescription(jsonTrail: JsonTrail) : Seq[String] = jsonTrail.path.foldLeft(Seq.empty : Seq[String])((acc, pathComponent) => {
    val componentDescription = pathComponent match {
      case JsonObjectKey(key) => key
      case JsonArrayItem(index) => s"[${index}]"
      case _ => "shape?"
    }

    acc :+ componentDescription
  })

  def jsonTrailAssertion(jsonTrail: JsonTrail) = jsonTrail.path.lastOption match {
    case Some(value) => value match {
      case JsonObjectKey(key) => s"undocumented field"
      case JsonArrayItem(index) => s"undocumented shape at index ${index}"
      case _ => "undocumented"
    }
    case None => "undocumented"
  }

  def fieldName(fieldId: FieldId) = {
    rfcState.shapesState.fields(fieldId).descriptor.name
  }

}
