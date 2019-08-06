package com.seamless.oas

import com.seamless.contexts.shapes.Commands.{ProviderDescriptor, ShapeParameterId}
import com.seamless.contexts.shapes.FlattenedShape
import io.circe.Json

package object export {

  type Bindings =  Map[ShapeParameterId, Option[ProviderDescriptor]]

  case class GenericSchemaBuilder(shape: FlattenedShape, baseSchema: Bindings => Json, inliner: Option[Bindings => Json] = None) {
    def hasGenerics: Boolean = inliner.isDefined
  }

  sealed trait SerializationType
  case object AS_JSON extends SerializationType
  case object AS_YAML extends SerializationType

  case class Body(contentType: String, asJsonSchema: Option[Json]) {
    def toJson = {
      Json.obj(
        "content" -> Json.obj(
          contentType -> Json.obj(
            "schema" -> asJsonSchema.get
          )
        )
      )
    }
  }
  case class Response(description: Option[String], responseBody: Option[Body]) {
    def toJson = {
      val base = if (responseBody.isDefined) {
        responseBody.get.toJson
      } else {
        Json.obj()
      }

      Json.fromJsonObject(base.asObject.get.add("description", Json.fromString(description.getOrElse(""))))

    }

  }

  case class OASExportOptions(as: SerializationType = AS_JSON, flattened: Boolean = false)

  object WriteSchemas {

    case class Operation(operationId: String,
                         summary: Option[String],
                         description: Option[String],
                         requestBody: Option[Body],
                         responses: Vector[(String, Response)]) {

      def toJson = {
        var json = Json.obj().asObject.get
        json = json.add("operationId", Json.fromString(operationId))

        if (summary.isDefined) {
          json = json.add("summary", Json.fromString(summary.get))
        }
        if (description.isDefined) {
          json = json.add("description", Json.fromString(description.get))
        }

        if (requestBody.isDefined) {
          json = json.add("requestBody", requestBody.get.toJson)
        }

        if (responses.nonEmpty) {
          json = json.add("responses", Json.obj( responses.map(i => (i._1, i._2.toJson)):_* ))
        }

        Json.fromJsonObject(json)
      }

    }


    case class PathParameter(name: String, asJsonSchema: Json) {
      def toJson = {
        Json.obj(
          "in" -> Json.fromString("path"),
          "name" -> Json.fromString(name),
          "required" -> Json.fromBoolean(true),
          "schema" -> asJsonSchema
        )
      }
    }

    case class Path(absolutePath: String, operations: Map[String, Operation], pathParameters: Vector[PathParameter]) {
      def pathParametersToJson = {
        println(
          absolutePath+" "+
          pathParameters.length
        )
        "parameters" -> Json.arr( pathParameters.sortBy(p => absolutePath.indexOf("{"+p+"}")).map(_.toJson):_*)
      }

    }

  }


}
