package com.seamless.contexts.requests

import com.seamless.contexts.data_types.Commands.ShapeId
import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.ddd.ExportedCommand

import scala.scalajs.js.annotation.{JSExportAll, JSExportDescendentClasses}

object Commands {
  type PathComponentId = String
  type RequestId = String
  type ParameterId = String
  type ResponseId = String
  trait BodyDescriptor
  case class UnsetBodyDescriptor() extends BodyDescriptor
  case class ShapedBodyDescriptor(httpContentType: String, bodyShapeId: ShapeId) extends BodyDescriptor

  case class AddPathComponent(pathId: PathComponentId, parentPathId: PathComponentId, name: String) extends RequestsCommand
  case class RenamePathComponent(pathId: PathComponentId, name: String)
  case class RemovePathComponent(pathId: PathComponentId) extends RequestsCommand


  case class AddPathParameter(pathId: PathComponentId, parentPathId: PathComponentId, name: String) extends RequestsCommand
  case class SetPathParameterShape(pathId: PathComponentId, shapeId: ShapeId) extends RequestsCommand
  case class RemovePathParameter(pathId: PathComponentId) extends RequestsCommand


  case class AddRequest(requestId: RequestId, pathId: PathComponentId, httpMethod: String) extends RequestsCommand
  case class SetRequestBodyShape(requestId: RequestId, bodyDescriptor: BodyDescriptor) extends RequestsCommand
  case class RemoveRequest(requestId: RequestId) extends RequestsCommand


  case class AddQueryParameter(parameterId: ParameterId, requestId: RequestId, name: String) extends RequestsCommand
  case class SetQueryParameterShape(parameterId: ParameterId, shapeId: ShapeId) extends RequestsCommand
  case class RemoveQueryParameter(parameterId: ParameterId) extends RequestsCommand


  case class AddHeaderParameter(parameterId: ParameterId, requestId: RequestId, name: String) extends RequestsCommand
  case class SetHeaderParameterShape(parameterId: ParameterId, shapeId: ShapeId) extends RequestsCommand
  case class RemoveHeaderParameter(parameterId: ParameterId) extends RequestsCommand


  case class AddResponse(responseId: ResponseId, requestId: RequestId, httpStatusCode: Int) extends RequestsCommand
  case class SetResponseStatusCode(responseId: ResponseId, httpStatusCode: Int) extends RequestsCommand
  case class SetResponseBodyShape(responseId: ResponseId, bodyDescriptor: BodyDescriptor) extends RequestsCommand
  case class RemoveResponse(responseId: ResponseId) extends RequestsCommand

  @JSExportDescendentClasses
  @JSExportAll
  trait RequestsCommand extends RfcCommand with ExportedCommand

}