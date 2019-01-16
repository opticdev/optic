package com.useoptic.proxy.collection.jsonschema

import play.api.libs.json.{JsArray, JsObject, JsString}

object JsonSchemaMerge {

  def schemaType(o: JsObject) = (o \ "type").get.as[JsString].value

  def mergeQuerySchemas(schemas: Vector[JsObject]) = {

    if (schemas.forall(i => schemaType(i) != "array" )) {
      JsonSchemaBuilderUtil.oneOfBase(schemas:_*)
    } else { //@assumption if a field is EVER an array, it is always an array
      val arrayTypes = schemas.filter(i => schemaType(i) == "array")
      val nonArrayTypes = schemas.filterNot(i => schemaType(i) == "array")

      val containedTypes = (arrayTypes.flatMap(i => {
        (i \ "items").get match {
          case obj: JsObject if obj.value.contains("type") =>
            Vector(obj)
          case obj: JsObject if obj.value.contains("oneOf") =>
            (obj \ "oneOf").get.as[JsArray].value.toVector.asInstanceOf[Vector[JsObject]]
        }
      }) ++ nonArrayTypes).distinct

      JsonSchemaBuilderUtil.arraySchemaMultipleTypes(containedTypes:_*)

    }

  }

}
