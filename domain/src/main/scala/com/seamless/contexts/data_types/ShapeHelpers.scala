package com.seamless.contexts.data_types

import com.seamless.contexts.data_types.Primitives.StringT
import com.seamless.contexts.requests.Commands.ShapedRequestParameterShapeDescriptor
import com.seamless.contexts.requests.Events.{PathParameterAdded, PathParameterShapeSet, RequestParameterAdded, RequestParameterShapeSet, RequestsEvent}
import com.seamless.contexts.rfc.Events.RfcEvent

import scala.util.Random

object ShapeHelpers {

  private def rootId(): String = s"shape_${Random.alphanumeric take 10 mkString}"
  private def inlineConceptId(): String = s"inline_concept_${Random.alphanumeric take 10 mkString}"


  def appendDefaultStringTypeEvents(adder: RequestParameterAdded): Vector[RequestsEvent] = {
    val root = rootId()
    val concept = inlineConceptId()

    Vector(
      adder,
      Events.InlineConceptDefined(root, concept),
      Events.TypeAssigned(root, StringT, concept),
      RequestParameterShapeSet(adder.parameterId, ShapedRequestParameterShapeDescriptor(concept, isRemoved = false))
    ).asInstanceOf[Vector[RequestsEvent]]
  }

  def appendDefaultStringTypeEvents(adder: PathParameterAdded): Vector[RequestsEvent] = {
    val root = rootId()
    val concept = inlineConceptId()

    Vector(
      adder,
      Events.InlineConceptDefined(root, concept),
      Events.TypeAssigned(root, StringT, concept),
      PathParameterShapeSet(adder.pathId, ShapedRequestParameterShapeDescriptor(concept, isRemoved = false))
    ).asInstanceOf[Vector[RequestsEvent]]
  }
}
