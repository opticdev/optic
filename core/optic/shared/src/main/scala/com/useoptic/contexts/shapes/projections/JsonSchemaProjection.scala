package com.useoptic.contexts.shapes.projections

import com.useoptic.contexts.shapes.ShapesHelper.{BooleanKind, ListKind, MapKind, NullableKind, NumberKind, ObjectKind, OptionalKind, ReferenceKind, StringKind}
import com.useoptic.contexts.shapes.{ShapesHelper, ShapesState}
import io.circe.Json
import JsonSchemaHelpers._

class JsonSchemaProjection(shapeId: String)(implicit shapesState: ShapesState) {

  def asJsonSchema(expand: Boolean): Json = {
    val flatShape = FlatShapeProjection.forShapeId(shapeId)(shapesState)
    flatShapeToJsonSchema(flatShape.root, expand: Boolean)(flatShape)
  }


  private def flatShapeToJsonSchema(shape: FlatShape, expand: Boolean)(implicit projection: FlatShapeResult): Json = {
    val schema = new JsonSchema
    val isNamed = shapesState.shapes.get(shape.id).exists(_.descriptor.name != "")

    if (isNamed && !expand) {
      val name = shapesState.shapes(shape.id).descriptor.name
      schema.addRef(("#/components/schemas/"+ name.toCamelCase).asJson)
      return schema.asJson
    }

    if (isNamed && expand) {
      val name = shapesState.shapes(shape.id).descriptor.name
      schema.addTitle(name)
    }

    shape.baseShapeId match {
      case ObjectKind.baseShapeId => {
        schema.assignType("object".asJson)

        val required = new scala.collection.mutable.ListBuffer[String]()
        val fields = shape.fields.map { case field =>
          val fieldName = field.fieldName
          val fieldShape = flatShapeToJsonSchema(field.shape, expand = false)
          if (field.shape.baseShapeId != OptionalKind.baseShapeId) {
            required append fieldName
          }
          fieldName -> fieldShape
        }
        schema.addRequired(required.toList)
        schema.addProperties(fields)
      }

      case ListKind.baseShapeId => {
        schema.assignType("array".asJson)
        val inner = shape.links(ListKind.innerParam)
        schema.addItems(new JsonSchemaProjection(inner).asJsonSchema(expand = false))
      }

      case StringKind.baseShapeId => schema.assignType("string".asJson)
      case NumberKind.baseShapeId => schema.assignType("number".asJson)
      case BooleanKind.baseShapeId => schema.assignType("boolean".asJson)

      case OptionalKind.baseShapeId => {
        val inner = shape.links(OptionalKind.innerParam)
        return new JsonSchemaProjection(inner).asJsonSchema(expand = false)
      }

      case MapKind.baseShapeId | ReferenceKind.baseShapeId | NullableKind.baseShapeId | OptionalKind.baseShapeId => {
//        Logger.log("Core shape not implemented "+  shape.baseShapeId)
      }

      case _ => {
//        Logger.log("OAS not implemented for type "+ shape.baseShapeId)
      }
    }

    schema.asJson
  }

}

object JsonSchemaHelpers {

  implicit class IdiomaticJsonString(string: String) {
    def asJson = Json.fromString(string)
  }

  implicit class StringHelpersImpl(s: String) {
    def toCamelCase: String  = {
      val split = s.split(" ")
      val tail = split.tail.map { x => x.head.toUpper + x.tail }
      split.head + tail.mkString
    }
  }

  class JsonSchema {

    private var _internal = Json.obj().asObject.get

    def assignType(json: Json) = {
      _internal = _internal.add("type", json)
    }

    def addTitle(name: String) = {
      _internal = _internal.add("title", Json.fromString(name))
    }

    def addProperties(fields: Seq[(String, Json)]) = {
      _internal = _internal.add("properties", Json.obj(fields: _*))
    }
    def addRequired(required: List[String]) = {
      _internal = _internal.add("required", Json.arr(required.map(_.asJson):_*))
    }

    def addItems(json: Json) = {
      _internal = _internal.add("items", json)
    }

    def addRef(json: Json) = {
      _internal = _internal.add("$ref", json)
    }

    def allOf(innerSchemas: Seq[Json]) = {
      _internal = Json.obj(
        "allOf" -> Json.arr(innerSchemas: _*)
      ).asObject.get
    }

    def description(string: String) = {
      _internal = _internal.add("description", Json.fromString(string))
    }

    def replaceWith(json: Json) = _internal = json.asObject.get

    def asJson = Json.fromJsonObject(_internal)
  }

}
