package com.seamless.oas

import com.seamless.oas.JsonSchemaType.JsonSchemaType
import play.api.libs.json.JsObject

object Schemas {
  //traits
  abstract class OASSchema(implicit val ctx: ResolverContext)
  trait Parameter extends OASSchema {def description: Option[String] = ctx.resolver.descriptionFromContext(ctx)}

  //schemas
  case class Path(uri: String, id: String)(implicit ctx: ResolverContext) extends OASSchema {
    def operations: Vector[Operation] = ctx.resolver.operationsForPath(this)
    def pathParameters: Vector[PathParameter] = ctx.resolver.parametersForPath(this)
  }
  case class PathParameter(name: String, index: Int)(implicit ctx: ResolverContext) extends Parameter
  case class QueryParameter(name: String, required: Boolean)(implicit ctx: ResolverContext) extends Parameter
  case class HeaderParameter(name: String, required: Boolean)(implicit ctx: ResolverContext) extends Parameter
  case class Operation(method: String, path: Path)(implicit ctx: ResolverContext) extends OASSchema {
    def description: Option[String] = ctx.resolver.descriptionFromContext(ctx)
    def responses: Vector[Response] = ctx.resolver.responsesForOperation(this)
    def supportsBody: Boolean = !Set("get", "head", "options", "connect").contains(method)
    def requestBody: Option[RequestBody] = ctx.resolver.requestBodyForOperation(this)
    def queryParameters: Vector[QueryParameter] = ctx.resolver.queryParametersForOperation(this)
    def headerParameters: Vector[HeaderParameter] = ctx.resolver.headerParametersForOperation(this)
    def id: String = path.id + "_" + method
  }

  case class Response(status: Int, contentType: Option[String], schema: Option[JsonSchemaSchema])(implicit ctx: ResolverContext) extends OASSchema {
    def description: Option[String] = ctx.resolver.descriptionFromContext(ctx)
  }
  case class SharedResponse(id: String, contentType: Option[String], schema: Option[JsonSchemaSchema])(implicit ctx: ResolverContext) extends OASSchema {
    def description: Option[String] = ctx.resolver.descriptionFromContext(ctx)
  }

  case class RequestBody(contentType: Option[String], schema: Option[JsonSchemaSchema])(implicit ctx: ResolverContext) extends OASSchema {
    def description: Option[String] = ctx.resolver.descriptionFromContext(ctx)
  }

  //Json Schema
  trait JsonSchemaSchema extends OASSchema {
    def definition: JsObject
    def id: String
    def properties: Vector[PropertyDefinition] = {
      ctx.resolver.propertiesForDefinition(id, definition)
    }
    def schemaType: JsonSchemaType = JsonSchemaType.fromDefinition(definition)
    def description: Option[String] = ctx.resolver.descriptionFromContext(ctx)
  }

  case class NamedDefinition(name: String, definition: JsObject, id: String)(implicit ctx: ResolverContext) extends JsonSchemaSchema
  case class InlineDefinition(definition: JsObject, id: String)(implicit ctx: ResolverContext) extends JsonSchemaSchema
  case class PropertyDefinition(parentId: String, id: String, key: String, definition: JsObject)(implicit ctx: ResolverContext) extends JsonSchemaSchema
  case class ObjectDefinition(id: String, definition: JsObject, name: String)(implicit ctx: ResolverContext) extends JsonSchemaSchema
}

