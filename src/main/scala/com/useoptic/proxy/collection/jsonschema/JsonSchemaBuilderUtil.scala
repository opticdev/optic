package com.useoptic.proxy.collection.jsonschema

import play.api.libs.json.{JsObject, Json}

object JsonSchemaBuilderUtil {
  private val draft = "http://json-schema.org/draft-04/schema#"
  private val primitiveTypes = Set("string", "null", "number", "boolean")

  def basicSchema(`type`: String) = {
    require(primitiveTypes.contains(`type`), s"Type ${`type`} is not valid as JSON Schema Primitive")
    Json.obj("$schema" -> draft, "type" -> `type`)
  }

  def oneOfBase(types: JsObject*) = {
    Json.obj(
      "$schema" -> draft,
      "oneOf" -> types.map(removeSchemaField))
  }

  def arraySchemaOneType(`type`: String): JsObject = {
    Json.obj(
      "$schema" -> draft,
      "type" -> "array",
      "items" -> removeSchemaField(basicSchema(`type`)))
  }

  def arraySchemaMultipleTypes(types: JsObject*): JsObject = {

    Json.obj(
      "$schema" -> draft,
      "type" -> "array",
      "items" -> Json.obj(
        "oneOf" -> types.map(removeSchemaField)
    ))
  }

  def removeSchemaField(jsObject: JsObject) = jsObject - "$schema"
}
