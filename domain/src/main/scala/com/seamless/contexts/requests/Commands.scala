package com.seamless.contexts.requests

import com.seamless.contexts.data_types.Commands.ShapeId
import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.ddd.ExportedCommand

import scala.scalajs.js.annotation.{JSExportAll, JSExportDescendentClasses}

/*
By default, we'll add a root PathId
Paths represent the Resource Hierarchy
A PathComponent should have at most one PathParameter child

 */
object Commands {
  type PathComponentId = String
  type EndpointId = String
  type RequestId = String
  type ResponseId = String

  case class AddPathComponent(pathId: PathComponentId, parentPathId: PathComponentId, name: String) extends RequestsCommand
  case class RenamePathComponent(pathId: PathComponentId, name: String)
  case class RemovePathComponent(pathId: PathComponentId) extends RequestsCommand


  case class AddPathParameter(pathId: PathComponentId, parentPathId: PathComponentId, name: String) extends RequestsCommand
  case class SetPathParameterShape(pathId: PathComponentId, shapeId: ShapeId) extends RequestsCommand
  case class RemovePathParameter(pathId: PathComponentId) extends RequestsCommand


  case class AddQueryParameter(requestId: RequestId, name: String) extends RequestsCommand
  case class SetQueryParameterShape(requestId: RequestId, shapeId: ShapeId) extends RequestsCommand
  case class RemoveQueryParameter(requestId: RequestId) extends RequestsCommand


  case class AddHeaderParameter(requestId: RequestId, name: String) extends RequestsCommand
  case class SetHeaderParameterShape(requestId: RequestId, shapeId: ShapeId) extends RequestsCommand
  case class RemoveHeaderParameter(requestId: RequestId) extends RequestsCommand


  case class AddRequest(requestId: RequestId, pathId: PathComponentId, httpMethod: String) extends RequestsCommand
  case class SetRequestBodyShape(requestId: RequestId, shapeId: ShapeId) extends RequestsCommand
  case class RemoveRequest(requestId: RequestId) extends RequestsCommand


  case class AddResponse(responseId: ResponseId, requestId: RequestId, httpStatusCode: Int) extends RequestsCommand
  case class SetResponseStatusCode(responseId: ResponseId, httpStatusCode: Int) extends RequestsCommand
  case class SetResponseBodyShape(responseId: ResponseId, shapeId: ShapeId) extends RequestsCommand
  case class RemoveResponse(responseId: ResponseId)

  @JSExportDescendentClasses
  @JSExportAll
  trait RequestsCommand extends RfcCommand with ExportedCommand

}