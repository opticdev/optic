package com.useoptic

import com.useoptic.contexts.requests.Commands.{PathComponentId, RequestId, RequestParameterId, ResponseId}
import com.useoptic.contexts.shapes.Commands.{FieldId, ShapeId, ShapeParameterId}
import com.useoptic.dsa.OpticIds

import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
class OpticIdsJs() {
  private def ids = OpticIds.newRandomIdGenerator

  def newShapeId(): ShapeId = ids.newShapeId
  def newPathId(): PathComponentId = ids.newPathId
  def newRequestId(): RequestId = ids.newRequestId
  def newResponseId(): ResponseId = ids.newResponseId
  def newShapeParameterId(): ShapeParameterId = ids.newShapeParameterId
  def newRequestParameterId(): RequestParameterId = ids.newRequestParameterId
  def newFieldId(): FieldId = ids.newFieldId
}

object OpticIdsJs {
  def newSharedInstance = new OpticIdsJs()
}
