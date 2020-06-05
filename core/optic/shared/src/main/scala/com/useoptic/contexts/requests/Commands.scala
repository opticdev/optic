package com.useoptic.contexts.requests

import com.useoptic.contexts.shapes.Commands.ShapeId
import com.useoptic.contexts.rfc.Commands.RfcCommand
import com.useoptic.ddd.ExportedCommand

import scala.scalajs.js.annotation.{JSExportAll, JSExportDescendentClasses}

object Commands {
  type PathComponentId = String
  type RequestMethod = String
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

  case class AddRequest(requestId: RequestId, pathId: PathComponentId, httpMethod: RequestMethod) extends RequestsCommand
  //@GOTCHA #leftovers-from-designer-ui @TODO we should probably not support this command anymore, or enforce uniqueness of content types across multiple requests
  case class SetRequestContentType(requestId: RequestId, httpContentType: String) extends RequestsCommand
  //@GOTCHA #leftovers-from-designer-ui @TODO we should probably not support this command's ability to change the content type anymore, or enforce uniqueness of content types across multiple requests
  case class SetRequestBodyShape(requestId: RequestId, bodyDescriptor: ShapedBodyDescriptor) extends RequestsCommand
  //@GOTCHA #leftovers-from-designer-ui @TODO we should probably not support this command anymore, or enforce uniqueness of content types across multiple requests
  case class UnsetRequestBodyShape(requestId: RequestId) extends RequestsCommand
  case class RemoveRequest(requestId: RequestId) extends RequestsCommand

  @Deprecated
  case class AddQueryParameter(parameterId: RequestParameterId, requestId: RequestId, name: String) extends RequestsCommand
  @Deprecated
  case class SetQueryParameterShape(parameterId: RequestParameterId, parameterDescriptor: ShapedRequestParameterShapeDescriptor) extends RequestsCommand
  @Deprecated
  case class RenameQueryParameter(parameterId: RequestParameterId, name: String) extends RequestsCommand
  @Deprecated
  case class UnsetQueryParameterShape(parameterId: RequestParameterId) extends RequestsCommand
  @Deprecated
  case class RemoveQueryParameter(parameterId: RequestParameterId) extends RequestsCommand

  case class AddHeaderParameter(parameterId: RequestParameterId, requestId: RequestId, name: String) extends RequestsCommand
  case class SetHeaderParameterShape(parameterId: RequestParameterId, parameterDescriptor: ShapedRequestParameterShapeDescriptor) extends RequestsCommand
  case class RenameHeaderParameter(parameterId: RequestParameterId, name: String) extends RequestsCommand
  case class UnsetHeaderParameterShape(parameterId: RequestParameterId) extends RequestsCommand
  case class RemoveHeaderParameter(parameterId: RequestParameterId) extends RequestsCommand
  @Deprecated
  case class AddResponse(responseId: ResponseId, requestId: RequestId, httpStatusCode: Int) extends RequestsCommand
  case class AddResponseByPathAndMethod(responseId: ResponseId, pathId: PathComponentId, httpMethod: RequestMethod, httpStatusCode: Int) extends RequestsCommand
  //@GOTCHA #leftovers-from-designer-ui @TODO we should probably not support this command anymore, or enforce uniqueness of content types across multiple requests
  case class SetResponseContentType(responseId: ResponseId, httpContentType: String) extends RequestsCommand
  //@GOTCHA #leftovers-from-designer-ui @TODO we should probably not support this command anymore
  case class SetResponseStatusCode(responseId: ResponseId, httpStatusCode: Int) extends RequestsCommand
  //@GOTCHA #leftovers-from-designer-ui @TODO we should probably not support this command's ability to change the content type anymore, or enforce uniqueness of content types across multiple responses
  case class SetResponseBodyShape(responseId: ResponseId, bodyDescriptor: ShapedBodyDescriptor) extends RequestsCommand
  //@GOTCHA @TODO we should probably not support this command anymore, or enforce uniqueness of content types across multiple responses
  case class UnsetResponseBodyShape(responseId: ResponseId) extends RequestsCommand
  case class RemoveResponse(responseId: ResponseId) extends RequestsCommand

  @JSExportDescendentClasses
  @JSExportAll
  sealed trait RequestsCommand extends RfcCommand with ExportedCommand

}
