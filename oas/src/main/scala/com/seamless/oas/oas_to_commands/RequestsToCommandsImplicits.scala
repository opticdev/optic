package com.seamless.oas.oas_to_commands

import com.seamless.contexts.data_types.Commands._
import com.seamless.contexts.data_types.Primitives._
import com.seamless.contexts.requests.Commands._
import com.seamless.contexts.rfc.Commands.{AddContribution, RfcCommand}
import com.seamless.oas.JsonSchemaType.{EitherType, JsonSchemaType, Ref, SingleType}
import com.seamless.oas.Schemas.{Definition, JsonSchemaSchema, NamedDefinition, Operation, Path, PropertyDefinition}
import com.seamless.oas.{Context, JsonSchemaType}
import play.api.libs.json.JsArray
import JsonSchemaToCommandsImplicits._
import com.seamless.contexts.requests.Utilities

import scala.util.Random

object RequestsToCommandsImplicits {
  private def newResponseId(): String = s"response_${Random.alphanumeric take 10 mkString}"
  private def newParameterId(): String = s"parameter_${Random.alphanumeric take 10 mkString}"
  private def newRequestBodyId(): String = s"request_body_${Random.alphanumeric take 10 mkString}"

  case class APIPathsContext(commands: ImmutableCommandStream, uriToId: String => String) {
    def pathToId(path: Path): String = uriToId(path.uri)
  }

  implicit class PathsToCommands(pathVector: Vector[Path]) {

    def toCommandStream: APIPathsContext = {
      val stream = CommandStream.emptyMutable

      val pathInfo = Utilities.oasPathsToPathComponentInfoSeq(pathVector.map(_.uri), new Iterator[String] {
        //keep it stable, but add some entropy in case we ever merge graphs
        val seedString = s"${Random.alphanumeric take 6 mkString}"
        var index = -1
        override def hasNext: Boolean = true
        override def next(): String = {
          index = index + 1
          s"${seedString}_path_${index.toString}"
        }
      })

      val commands = pathInfo.map {
        case param if param.isPathParameter =>
          AddPathParameter(param.pathId, param.parentPathId, param.pathParameterName)
        case comp =>
          AddPathComponent(comp.pathId, comp.parentPathId, comp.name)
      }.toVector

      stream appendInit commands

      APIPathsContext(
        stream.toImmutable,
        (uri: String) => {
          if (Utilities.isRootPath(uri)) {
            import com.seamless.contexts.requests.Commands.{rootPathId}
            rootPathId
          } else {
            pathInfo.find(_.originalPaths contains uri).map(_.pathId).get
          }
        }
      )
    }

  }


  implicit class OperationToRequest(operation: Operation)(implicit pathContext: APIPathsContext) {

    private def isInlineSchema(schema: Option[JsonSchemaSchema]): Boolean =
      schema.isDefined && schema.get.isInstanceOf[Definition]

    def toCommandStream: ImmutableCommandStream = {
      val stream = CommandStream.emptyMutable

      stream.appendInit(
        AddRequest(operation.id, pathContext.pathToId(operation.path), operation.method)
      )

      if (operation.requestBody.isDefined && isInlineSchema(operation.requestBody.get.schema)) {
        val schema = operation.requestBody.get.schema.get.asInstanceOf[Definition]
        val contentType = operation.requestBody.get.contentType.getOrElse("application/json")
        val inlineRequestSchemaCommands = schema.toCommandStream
        //add init events for the inline schema
        stream appendInit inlineRequestSchemaCommands.flatten
        stream appendDescribe SetRequestBodyShape(operation.id, ShapedBodyDescriptor(contentType, schema.id, isRemoved = false))

        if (operation.requestBody.get.description.isDefined) {
          stream appendDescribe AddContribution(operation.id, "body-description", operation.requestBody.get.description.get)
        }
      }

      operation.responses.foreach { response => {
        val responseId = newResponseId()
        stream appendInit AddResponse(responseId, operation.id, response.status)
        if (isInlineSchema(response.schema)) {
          val inlineSchemaCommands = response.schema.get.toCommandStream
          val contentType = response.contentType.getOrElse("application/json")
//          add init events for the inline schema
          stream appendInit inlineSchemaCommands.flatten
          stream appendDescribe SetResponseBodyShape(responseId, ShapedBodyDescriptor(contentType, response.schema.get.asInstanceOf[Definition].id, isRemoved = false))

          if (response.description.isDefined) {
            stream appendDescribe AddContribution(responseId, "description", response.description.get)
          }
        }
      }}

      operation.queryParameters.foreach(i => {
        val queryParameterId = newParameterId()
        stream appendDescribe AddQueryParameter(queryParameterId, operation.id, i.name)
      })

      operation.headerParameters.foreach(i => {
        val headerParameterId = newParameterId()
        stream appendDescribe AddHeaderParameter(headerParameterId, operation.id, i.name)
      })

      if (operation.description.isDefined) {
        stream appendDescribe AddContribution(operation.id, "description", operation.description.get)
      }

      stream.toImmutable
    }
  }

}
