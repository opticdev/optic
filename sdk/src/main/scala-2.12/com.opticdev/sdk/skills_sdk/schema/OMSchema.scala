package com.opticdev.sdk.skills_sdk.schema

import com.github.fge.jsonschema.main.JsonSchema
import com.opticdev.common.{SGExportable, SchemaRef}
import com.opticdev.sdk.descriptions.{PackageExportable}
import play.api.libs.json.{JsObject, JsString, JsValue}
import com.fasterxml.jackson.databind.JsonNode
import com.github.fge.jsonschema.core.report.ProcessingReport
import com.github.fge.jsonschema.main.{JsonSchema, JsonSchemaFactory}
import com.opticdev.common.{PackageRef, SGExportable, SchemaRef}
import play.api.libs.json._

import scala.util.Try
import scala.util.hashing.MurmurHash3

case class OMSchema(schemaRef: SchemaRef, definition: JsObject, internal: Boolean = false) extends PackageExportable with SGExportable {

  val name : String = (definition \ "title").asOpt[JsString].getOrElse(JsString(schemaRef.id)).value

  private val jsonSchema : JsonSchema = OMSchema.schemaObjectFromJson(definition)

  def validate(jsValue: JsValue): Boolean = OMSchema.validate(jsonSchema, jsValue)
  def validationReport(jsValue: JsValue) = OMSchema.validationReport(jsonSchema, jsValue)

  def toColdStorage = {
    OMSchemaColdStorage(schemaRef.full, definition.toString())
  }

}

object OMSchema {

  private val validatorFactory = JsonSchemaFactory.newBuilder().freeze()

  def schemaObjectFromJson(schema: JsObject): JsonSchema = {
    if (validatorFactory.getSyntaxValidator.schemaIsValid(schema.as[JsonNode])) {
      validatorFactory.getJsonSchema(schema.as[JsonNode])
    } else throw new Error("Invalid Schema "+ validatorFactory.getSyntaxValidator.validateSchema(schema.as[JsonNode]).toString)
  }

  def validate(jsonSchema: JsonSchema, value: JsValue) = jsonSchema.validInstance(value.as[JsonNode])
  def validationReport(jsonSchema: JsonSchema, value: JsValue): ProcessingReport = jsonSchema.validate(value.as[JsonNode])
}

//better way to pickle the schemas
case class OMSchemaColdStorage(schemaRefAsString: String, data: String)