package com.seamless.oas.oas_to_commands

import com.seamless.contexts.data_types.Commands._
import com.seamless.contexts.data_types.Primitives._
import com.seamless.contexts.requests.Commands._
import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.oas.JsonSchemaType.{EitherType, JsonSchemaType, Ref, SingleType}
import com.seamless.oas.Schemas.{Definition, JsonSchemaSchema, NamedDefinition, Operation, PropertyDefinition}
import com.seamless.oas.{Context, JsonSchemaType}
import play.api.libs.json.JsArray
import JsonSchemaToCommandsImplicits._

import scala.util.Random

object RequestsToCommandsImplicits {

  private def newResponseId(): String = s"response_${Random.alphanumeric take 10 mkString}"
  private def newRequestBodyId(): String = s"request_body_${Random.alphanumeric take 10 mkString}"


  implicit class OperationToRequest(operation: Operation) {

    private def isInlineSchema(schema: Option[JsonSchemaSchema]): Boolean =
      schema.isDefined && schema.get.isInstanceOf[Definition]

    def toCommandStream: ImmutableCommandStream = {

      val stream = CommandStream.emptyMutable

      stream.appendInit(
        AddRequest(operation.id, operation.path.id, operation.method)
      )


      if (operation.requestBody.isDefined && isInlineSchema(operation.requestBody.get.schema)) {
        val requestBodyId = newRequestBodyId()
        val schema = operation.requestBody.get.schema.get.asInstanceOf[Definition]
        val inlineRequestSchemaCommands = schema.toCommandStream
        //add init events for the inline schema
        stream appendInit inlineRequestSchemaCommands.flatten
        stream appendDescribe SetRequestBodyShape(operation.id, schema.id)

      }

      operation.responses.foreach { response => {

        val responseId = newResponseId()

        stream appendInit AddResponse(responseId, operation.id, response.status)

        if (isInlineSchema(response.schema)) {
          val inlineSchemaCommands = response.schema.get.toCommandStream
          //add init events for the inline schema
          stream appendInit inlineSchemaCommands.flatten
          stream appendDescribe SetResponseBodyShape(responseId, response.schema.get.asInstanceOf[Definition].id)
        }
      }}

      stream.toImmutable
    }
  }

}
