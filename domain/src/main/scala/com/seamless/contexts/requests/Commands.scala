package com.seamless.contexts.requests

import com.seamless.contexts.shapes.Commands.ShapeId
import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.ddd.ExportedCommand

import scala.scalajs.js.annotation.{JSExportAll, JSExportDescendentClasses}

object Commands {
  type PathComponentId = String
  type RequestId = String
  type RequestParameterId = String
  type ResponseId = String
  val rootPathId = "root"

  @JSExportDescendentClasses
  @JSExportAll
  sealed trait PathComponentDescriptor {
    val parentPathId: PathComponentId
    val name: String
  }
  case class ParameterizedPathComponentDescriptor(parentPathId: PathComponentId, name: String, requestParameterDescriptor: RequestParameterShapeDescriptor) extends PathComponentDescriptor
  case class BasicPathComponentDescriptor(parentPathId: PathComponentId, name: String) extends PathComponentDescriptor

  @JSExportDescendentClasses
  @JSExportAll
  sealed trait RequestParameterShapeDescriptor
  case class UnsetRequestParameterShapeDescriptor() extends RequestParameterShapeDescriptor
  case class ShapedRequestParameterShapeDescriptor(shapeId: ShapeId, isRemoved: Boolean) extends RequestParameterShapeDescriptor


  @JSExportDescendentClasses
  @JSExportAll
  sealed trait BodyDescriptor
  case class UnsetBodyDescriptor() extends BodyDescriptor
  case class ShapedBodyDescriptor(httpContentType: String, shapeId: ShapeId, isRemoved: Boolean) extends BodyDescriptor

  case class AddPathComponent(pathId: PathComponentId, parentPathId: PathComponentId, name: String) extends RequestsCommand
  case class RenamePathComponent(pathId: PathComponentId, name: String) extends RequestsCommand
  case class RemovePathComponent(pathId: PathComponentId) extends RequestsCommand

  case class AddPathParameter(pathId: PathComponentId, parentPathId: PathComponentId, name: String) extends RequestsCommand
  case class SetPathParameterShape(pathId: PathComponentId, shapedRequestParameterShapeDescriptor: ShapedRequestParameterShapeDescriptor) extends RequestsCommand
  case class RenamePathParameter(pathId: PathComponentId, name: String) extends RequestsCommand
  case class RemovePathParameter(pathId: PathComponentId) extends RequestsCommand

  case class AddRequest(requestId: RequestId, pathId: PathComponentId, httpMethod: String) extends RequestsCommand
  case class SetRequestContentType(requestId: RequestId, httpContentType: String) extends RequestsCommand
  case class SetRequestBodyShape(requestId: RequestId, bodyDescriptor: ShapedBodyDescriptor) extends RequestsCommand
  case class UnsetRequestBodyShape(requestId: RequestId) extends RequestsCommand
  case class RemoveRequest(requestId: RequestId) extends RequestsCommand

  case class AddQueryParameter(parameterId: RequestParameterId, requestId: RequestId, name: String) extends RequestsCommand
  case class SetQueryParameterShape(parameterId: RequestParameterId, parameterDescriptor: ShapedRequestParameterShapeDescriptor) extends RequestsCommand
  case class RenameQueryParameter(parameterId: RequestParameterId, name: String) extends RequestsCommand
  case class UnsetQueryParameterShape(parameterId: RequestParameterId) extends RequestsCommand
  case class RemoveQueryParameter(parameterId: RequestParameterId) extends RequestsCommand

  case class AddHeaderParameter(parameterId: RequestParameterId, requestId: RequestId, name: String) extends RequestsCommand
  case class SetHeaderParameterShape(parameterId: RequestParameterId, parameterDescriptor: ShapedRequestParameterShapeDescriptor) extends RequestsCommand
  case class RenameHeaderParameter(parameterId: RequestParameterId, name: String) extends RequestsCommand
  case class UnsetHeaderParameterShape(parameterId: RequestParameterId) extends RequestsCommand
  case class RemoveHeaderParameter(parameterId: RequestParameterId) extends RequestsCommand

  case class AddResponse(responseId: ResponseId, requestId: RequestId, httpStatusCode: Int) extends RequestsCommand
  case class SetResponseContentType(responseId: ResponseId, httpContentType: String) extends RequestsCommand
  case class SetResponseStatusCode(responseId: ResponseId, httpStatusCode: Int) extends RequestsCommand
  case class SetResponseBodyShape(responseId: ResponseId, bodyDescriptor: ShapedBodyDescriptor) extends RequestsCommand
  case class UnsetResponseBodyShape(responseId: ResponseId) extends RequestsCommand
  case class RemoveResponse(responseId: ResponseId) extends RequestsCommand

  @JSExportDescendentClasses
  @JSExportAll
  sealed trait RequestsCommand extends RfcCommand with ExportedCommand

}