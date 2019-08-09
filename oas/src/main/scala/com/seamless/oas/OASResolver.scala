package com.seamless.oas

import com.seamless.oas.Schemas.{InlineDefinition, HeaderParameter, JsonSchemaSchema, NamedDefinition, OASSchema, Operation, Path, PathParameter, PropertyDefinition, QueryParameter, RequestBody, Response, SharedResponse}
import play.api.libs.json.{JsObject, JsString, JsValue}
import QueryImplicits._
import com.seamless.oas
import com.seamless.oas.oas_to_commands.slugify

abstract class OASResolver(val root: JsObject, val oas_version: String) {
  def buildContext(root: JsValue) = ResolverContext(this, root)

  //Top Level OAS Resolvers
  val paths: Vector[Path] = {
    (root \ "paths").get.as[JsObject].value.toVector.map {
      case (path, value) => {
        Path(path, IdGenerator.path)(buildContext(value))
      }
    }
  }

  def title: Option[String] = (root \ "info" \ "title").toOption.map(_.as[JsString].value)

  def operationsForPath(path: Path)(implicit ctx: ResolverContext): Vector[Operation] = {
    path.ctx.root.as[JsObject].value.collect {
      case (op, value) if oas.supportedOperations.contains(op) => Operation(op, path)(buildContext(value))
    }.toVector
  }

  def parametersForPath(path: Path)(implicit ctx: ResolverContext): Vector[PathParameter]

  def queryParametersForOperation(operation: Operation)(implicit ctx: ResolverContext): Vector[QueryParameter]
  def headerParametersForOperation(operation: Operation)(implicit ctx: ResolverContext): Vector[HeaderParameter]
  def requestBodyForOperation(operation: Operation)(implicit ctx: ResolverContext): Option[RequestBody]
  def responsesForOperation(operation: Operation)(implicit ctx: ResolverContext): Vector[Response]

  def definitions: Vector[NamedDefinition]
  def resolveDefinition(ref: String): Option[NamedDefinition] = {
    JSONReference.walk(ref, root).flatMap(node => definitions.withRoot(node))
  }

  def sharedResponses: Vector[SharedResponse]
  def resolveSharedResponse(ref: String): Option[SharedResponse] = {
    JSONReference.walk(ref, root).flatMap(node => sharedResponses.withRoot(node))
  }

  //Json Schema Resolvers
  def propertiesForDefinition(parentId: String, definition: JsObject): Vector[PropertyDefinition] = {
    val definitionType = typeForDefinition(definition)

    if (definitionType.hasProperties) {
      (definition \ "properties").getOrElse(JsObject.empty).as[JsObject].value
        .map {
          case (key, value) => {
            val fieldId = IdGenerator.field
            println(s"found field ${fieldId} in ${parentId}", key, value)
            PropertyDefinition(
              parentId,
              fieldId,
              key,
              value.as[JsObject]
            )(buildContext(value))
          }
        }
        .toVector

    } else Vector.empty

  }
  def typeForDefinition(definition: JsObject): JsonSchemaType.JsonSchemaType = {
    JsonSchemaType.fromDefinition(definition)
  }



  //descriptions
  def descriptionFromContext(ctx: ResolverContext): Option[String] = {
    (ctx.root \ "description").toOption.map(_.as[JsString].value.trim)
  }

  def license: Option[String] = {
    (root \ "info" \ "license" \ "name").toOption.map(_.as[JsString].value)
  }
}

object IdGenerator {
  val pathIds = Iterator.from(1)
  val definitionIds = Iterator.from(1)
  val inlineIds = Iterator.from(1)
  val fieldIds = Iterator.from(1)
  def path = s"path_${pathIds.next()}"
  def definition(name: String) = s"concept_${definitionIds.next()}_${slugify(name)}"
  def inlineDefinition = s"inline-shape_${inlineIds.next()}"
  def field = s"field_${fieldIds.next()}"
  def stableInlineRequestBodyDefinition(operation: Operation) = s"body-shape_${slugify(operation.path.uri)}_${slugify(operation
    .method)}_body"
}