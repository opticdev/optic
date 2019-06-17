package com.seamless.oas

import com.seamless.oas.Schemas.{Definition, JsonSchemaSchema, NamedDefinition, OASSchema, Operation, Path, PathParameter, PropertyDefinition, QueryParameter, RequestBody, Response, SharedResponse}
import play.api.libs.json.{JsObject, JsString, JsValue}
import QueryImplicits._
import com.seamless.oas
import com.seamless.oas.oas_to_commands.slugify

import scala.util.Random

abstract class OASResolver(val root: JsObject, val oas_version: String) {
  def buildContext(root: JsValue) = Context(this, root)

  //Top Level OAS Resolvers
  val paths: Vector[Path] = {
    (root \ "paths").get.as[JsObject].value.toVector.map {
      case (path, value) => {
        Path(path, IdGenerator.path)(buildContext(value))
      }
    }
  }

  def title: Option[String] = (root \ "info" \ "title").toOption.map(_.as[JsString].value)

  def operationsForPath(path: Path)(implicit ctx: Context): Vector[Operation] = {
    path.cxt.root.as[JsObject].value.collect {
      case (op, value) if oas.supportedOperations.contains(op) => Operation(op, path)(buildContext(value))
    }.toVector
  }

  def parametersForPath(path: Path)(implicit ctx: Context): Vector[PathParameter]

  def queryParametersForOperation(operation: Operation)(implicit ctx: Context): Vector[QueryParameter]
  def requestBodyForOperation(operation: Operation)(implicit ctx: Context): Option[RequestBody]
  def responsesForOperation(operation: Operation)(implicit ctx: Context): Vector[Response]

  def definitions: Vector[NamedDefinition]
  def resolveDefinition(ref: String): Option[NamedDefinition] = {
    JSONReference.walk(ref, root).flatMap(node => definitions.withRoot(node))
  }

  def sharedResponses: Vector[SharedResponse]
  def resolveSharedResponse(ref: String): Option[SharedResponse] = {
    JSONReference.walk(ref, root).flatMap(node => sharedResponses.withRoot(node))
  }

  //Json Schema Resolvers
  def propertiesForDefinition(definition: JsObject): Vector[PropertyDefinition] = {
    val hasProperties = typeForDefinition(definition).hasProperties

    if (hasProperties) {
      (definition \ "properties").getOrElse(JsObject.empty).as[JsObject].value
        .map {
          case (key, value) => PropertyDefinition(
            key,
            value.as[JsObject]
          )(buildContext(value))
        }
        .toVector

    } else Vector.empty

  }
  def typeForDefinition(definition: JsObject): JsonSchemaType.JsonSchemaType = {
    JsonSchemaType.fromDefinition(definition)
  }

  object IdGenerator {
    def path = s"path_${Random.alphanumeric take 10 mkString}}"
    def definition(name: String) = s"concept_${Random.alphanumeric take 6 mkString}_${slugify(name)}"
    def inlineDefinition = s"concept_${Random.alphanumeric take 12 mkString}"
    def stableInlineRequestBodyDefinition(operation: Operation) = s"concept_${slugify(operation.path.uri)}_${slugify(operation
    .method)}_body"
  }

  //descriptions
  def descriptionFromContext(ctx: Context): Option[String] = {
    (ctx.root \ "description").toOption.map(_.as[JsString].value)
  }
}

