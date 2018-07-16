package com.opticdev.sdk.opticmarkdown2

import com.fasterxml.jackson.databind.JsonNode
import com.github.fge.jsonschema.main.{JsonSchema, JsonSchemaFactory}
import com.opticdev.common.{PackageRef, SchemaRef}
import play.api.libs.json._
import com.opticdev.common.PackageRef.packageRefJsonFormat
import com.opticdev.sdk.opticmarkdown2.lens.OMLens
import com.opticdev.sdk.opticmarkdown2.schema.OMSchema

import scala.util.Try

object OMParser {

  val validatorFactory = JsonSchemaFactory.newBuilder().freeze()

  def parseSchema(definition: JsObject)(implicit schemaRef: SchemaRef, internal: Boolean = false): Try[OMSchema] = Try {

    require(validatorFactory.getSyntaxValidator.schemaIsValid(definition.as[JsonNode]),
      "Invalid Schema "+ validatorFactory.getSyntaxValidator.validateSchema(definition.as[JsonNode]).toString)

    import Serialization.omschemaFormat
    Json.fromJson[OMSchema](
      schemaDefinitionToJsObject(definition, schemaRef, internal)
    ).get
  }

  def parseLens(configuration: JsObject)(implicit packageRef: PackageRef): Try[OMLens] = Try {
    import Serialization.omlensFormat

    val id = (configuration \ "id").get.as[JsString].value

    //add packageRef ->

    val updatedSchema = configuration.fieldSet.find(_._1 == "schema").collect {
      case (k: String, v: JsObject) => {
        val definition = v + ("title" -> (configuration \ "name").get.as[JsString])
        (k, schemaDefinitionToJsObject(definition, SchemaRef(Some(packageRef), id), internal = true))
      }
      case p => p
    }.get

    val withExtraFields = configuration + updatedSchema + ("packageRef" -> JsString(packageRef.full))

    val parsed = Json.fromJson[OMLens](withExtraFields).map(parsedLens => {
      if (parsedLens.schema.isLeft) {
        parsedLens.copy(schema = Left(parsedLens.schema.left.get.withPackageIfMissing(packageRef)))
      } else {
        parsedLens
      }
    })

    parsed.get
  }

  //helpers
  private def schemaDefinitionToJsObject(definition: JsObject, schemaRef: SchemaRef, internal: Boolean) = {
    JsObject(Seq(
      "definition" -> definition,
      "schemaRef" -> Json.toJson[SchemaRef](schemaRef),
      "internal" ->  JsBoolean(internal)
    ))
  }
}
