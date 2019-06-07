package com.seamless

import play.api.libs.json.{JsArray, JsObject, JsString, JsValue}

package object oas {
  case class Context(resolver: OASResolver, root: JsValue)


  val supportedOperations = Set(
    "get",
    "post",
    "put",
    "patch",
    "delete",
    "head",
    "options",
    "trace"
  )

  object JsonSchemaType {

    sealed trait JsonSchemaType {
      def hasProperties: Boolean
    }

    case class SingleType(t: String) extends JsonSchemaType {
      override def hasProperties: Boolean = t == "object"
    }

    case class EitherType(typeParameters: Vector[JsonSchemaType]) extends JsonSchemaType {
      override def hasProperties: Boolean = typeParameters.exists(_.hasProperties)
    }
    case class Ref(resourceURI: String) extends JsonSchemaType {
      override def hasProperties: Boolean = false
    }

    case object Skipped extends JsonSchemaType {
      override def hasProperties: Boolean = false
    }


    def fromDefinition(json: JsValue): JsonSchemaType = {

      if (json.isInstanceOf[JsString]) {
        return SingleType(json.as[JsString].value)
      }

      val refKvP = json \ "$ref"
      val typeKvP = json \ "type"
      val oneOfKvP = json \ "oneOf"
      if (refKvP.isDefined && refKvP.get.isInstanceOf[JsString]) {
        Ref(refKvP.get.as[JsString].value)
      } else if (typeKvP.isDefined && typeKvP.get.isInstanceOf[JsString]) {
        SingleType(typeKvP.get.as[JsString].value)
      } else if (oneOfKvP.isDefined && oneOfKvP.get.isInstanceOf[JsArray]) {
        val subTypes = oneOfKvP.get.asInstanceOf[JsArray].value.map(fromDefinition)
        EitherType(subTypes.toVector)
      } else {
        Skipped
      }
    }
  }

}
