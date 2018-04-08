package com.opticdev.sdk.descriptions

import com.fasterxml.jackson.databind.JsonNode
import com.github.fge.jsonschema.main.{JsonSchema, JsonSchemaFactory}
import com.opticdev.common.PackageRef
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

  def validate(jsonSchema: JsonSchema, value: JsValue) = jsonSchema.validate(value.as[JsonNode]).isSuccess

  def fromJson(schemaId: SchemaRef, jsValue: JsValue): Schema = {
    Schema(schemaId, jsValue.as[JsObject])
  }

  override def fromJson(jsValue: JsValue) = fromJson(null, jsValue)
}

case class Schema(schemaRef: SchemaRef, definition: JsObject) extends PackageExportable {

  val name : String = (definition \ "title").asOpt[JsString].getOrElse(JsString(schemaRef.id)).value

  private val jsonSchema : JsonSchema = Schema.schemaObjectFromJson(definition)

  def validate(jsValue: JsValue): Boolean = Schema.validate(jsonSchema, jsValue)

  def toJson = definition ++ JsObject(Seq("_identifier" -> JsString(schemaRef.full)))

  def toColdStorage = {
    SchemaColdStorage(toJson.toString())
  }

}

case class SchemaColdStorage(data: String)

case class SchemaRef(packageRef: Option[PackageRef], id: String) {
  def full: String = if (packageRef.isEmpty) id else packageRef.get.full+"/"+id
  def fullyQualified(lens: Lens) : SchemaRef = {
    if (packageRef.isEmpty) {
      SchemaRef(Some(lens.packageRef), id)
    } else this
  }
}

object SchemaRef {

  implicit val schemaRefFormats = new Format[SchemaRef] {
    import PackageRef.packageRefJsonFormat

    override def writes(o: SchemaRef) = JsString(o.full)

    override def reads(json: JsValue) = JsSuccess(SchemaRef.fromString(json.as[JsString].value).get)
  }


  def fromString(string: String, parentRef: Option[PackageRef] = None): Try[SchemaRef] = Try {
    val components = string.split("/")

    if (string.isEmpty) throw new Exception("Invalid Schema format")

    if (components.size == 1) {
      SchemaRef(parentRef, components(0))
    } else if (components.size == 2) {
      val packageId = PackageRef.fromString(components.head)
      val schema = components(1)
      SchemaRef(Some(packageId.get), schema)
    } else {
      throw new Exception("Invalid Schema format")
    }
  }

  val empty = SchemaRef(null, null)

}