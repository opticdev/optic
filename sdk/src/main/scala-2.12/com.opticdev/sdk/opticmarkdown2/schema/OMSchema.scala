package com.opticdev.sdk.opticmarkdown2.schema

import com.github.fge.jsonschema.main.JsonSchema
import com.opticdev.common.{SGExportable, SchemaRef}
import com.opticdev.sdk.descriptions.{PackageExportable, Schema}
import play.api.libs.json.{JsObject, JsString, JsValue}

case class OMSchema(schemaRef: SchemaRef, definition: JsObject, internal: Boolean = false) extends PackageExportable with SGExportable {

  val name : String = (definition \ "title").asOpt[JsString].getOrElse(JsString(schemaRef.id)).value

  private val jsonSchema : JsonSchema = Schema.schemaObjectFromJson(definition)

  def validate(jsValue: JsValue): Boolean = Schema.validate(jsonSchema, jsValue)
  def validationReport(jsValue: JsValue) = Schema.validationReport(jsonSchema, jsValue)

  def toColdStorage = {
    OMSchemaColdStorage(schemaRef.full, definition.toString())
  }

}

//better way to pickle the schemas
case class OMSchemaColdStorage(schemaRefAsString: String, data: String)