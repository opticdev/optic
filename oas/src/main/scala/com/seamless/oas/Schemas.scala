package com.seamless.oas

import com.seamless.oas.JsonSchemaType.JsonSchemaType
import play.api.libs.json.JsObject

object Schemas {
  abstract class OASSchema(implicit val cxt: Context)

  case class Path(uri: String, id: String)(implicit cxt: Context) extends OASSchema {
    def operations: Vector[Operation] = cxt.resolver.operationsForPath(this)
    def pathParameters: Vector[PathParameter] = cxt.resolver.parametersForPath(this)
  }
  case class PathParameter(name: String, index: Int)
  case class QueryParameter(name: String, required: Boolean)
  case class Operation(method: String, path: Path)(implicit cxt: Context) extends OASSchema {
    def responses: Vector[Response] = cxt.resolver.responsesForOperation(this)
    def supportsBody = !Set("get", "head", "options", "connect").contains(method)
    def requestBody: Option[RequestBody] = cxt.resolver.requestBodyForOperation(this)
    def queryParameters: Vector[QueryParameter] = cxt.resolver.queryParametersForOperation(this)
    def id = path.id+"_"+method
  }

  case class Response(status: Int, contentType: Option[String], schema: Option[JsonSchemaSchema])(implicit cxt: Context) extends OASSchema
  case class SharedResponse(id: String, contentType: Option[String], schema: Option[JsonSchemaSchema])(implicit cxt: Context) extends OASSchema

  case class RequestBody(contentType: Option[String], schema: Option[JsonSchemaSchema])(implicit cxt: Context) extends OASSchema


  //Json Schema
  trait JsonSchemaSchema extends OASSchema {
    def definition: JsObject
    def properties: Vector[PropertyDefinition] = cxt.resolver.propertiesForDefinition(definition)
    def `type`: JsonSchemaType = JsonSchemaType.fromDefinition(definition)
  }

  case class NamedDefinition(name: String, definition: JsObject, id: String)(implicit cxt: Context) extends JsonSchemaSchema
  case class Definition(definition: JsObject, id: String)(implicit cxt: Context) extends JsonSchemaSchema
  case class PropertyDefinition(key: String, definition: JsObject)(implicit cxt: Context) extends JsonSchemaSchema
}

