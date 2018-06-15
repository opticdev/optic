package com.opticdev.sdk.descriptions

import com.fasterxml.jackson.databind.JsonNode
import com.github.fge.jsonschema.core.report.ProcessingReport
import com.github.fge.jsonschema.main.{JsonSchema, JsonSchemaFactory}
import com.opticdev.common.{PackageRef, SGExportable, SchemaRef}
import play.api.libs.json._

import scala.util.Try
import scala.util.hashing.MurmurHash3

object Schema extends Description[Schema] {

  implicit val schemaRefReads: Reads[SchemaRef] = (json: JsValue) => {
    if (json.isInstanceOf[JsString]) {
      JsSuccess(SchemaRef.fromString(json.as[JsString].value).get)
    } else {
      JsError(error = "SchemaRef must be a string")
    }
  }

  implicit val schemaReads: Reads[Schema] = (json: JsValue) => {
    if (json.isInstanceOf[JsObject]) {
      JsSuccess(Schema(null, json.as[JsObject]))
    } else {
      JsError(error = "Schema must be an object")
    }
  }

  private val validatorFactory = JsonSchemaFactory.newBuilder().freeze()

  def schemaObjectFromJson(schema: JsObject): JsonSchema = {
    if (validatorFactory.getSyntaxValidator.schemaIsValid(schema.as[JsonNode])) {
      validatorFactory.getJsonSchema(schema.as[JsonNode])
    } else throw new Error("Invalid Schema "+ validatorFactory.getSyntaxValidator.validateSchema(schema.as[JsonNode]).toString)
  }

  def validate(jsonSchema: JsonSchema, value: JsValue) = jsonSchema.validInstance(value.as[JsonNode])
  def validationReport(jsonSchema: JsonSchema, value: JsValue): ProcessingReport = jsonSchema.validate(value.as[JsonNode])

  def fromJson(schemaId: SchemaRef, jsValue: JsValue): Schema = {
    Schema(schemaId, jsValue.as[JsObject])
  }

  override def fromJson(jsValue: JsValue) = fromJson(null, jsValue)
}

case class Schema(schemaRef: SchemaRef, definition: JsObject) extends PackageExportable with SGExportable {

  val name : String = (definition \ "title").asOpt[JsString].getOrElse(JsString(schemaRef.id)).value

  private val jsonSchema : JsonSchema = Schema.schemaObjectFromJson(definition)

  def validate(jsValue: JsValue): Boolean = Schema.validate(jsonSchema, jsValue)
  def validationReport(jsValue: JsValue) = Schema.validationReport(jsonSchema, jsValue)

  def toJson = definition ++ JsObject(Seq("_identifier" -> JsString(schemaRef.full)))

  def toColdStorage = {
    SchemaColdStorage(toJson.toString())
  }

}

case class SchemaColdStorage(data: String)