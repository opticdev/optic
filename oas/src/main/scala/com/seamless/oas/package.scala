package com.seamless

import play.api.libs.json.{JsArray, JsString, JsValue}

package object oas {
  case class ResolverContext(resolver: OASResolver, root: JsValue)


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

    case class ObjectType() extends JsonSchemaType {
      override def hasProperties = true
    }

    case class ArrayType() extends JsonSchemaType {
      override def hasProperties = false
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


    //@todo add a the concept of a type with parameters so we can move the logic this one central place
    def fromDefinition(json: JsValue): JsonSchemaType = {

      if (json.isInstanceOf[JsString]) {
        return json.as[JsString].value match {
          case "object" => ObjectType()
          case "array" => ArrayType()
          case x => SingleType(x)
        }
      }

      val refKvP = json \ "$ref"
      val typeKvP = json \ "type"
      val oneOfKvP = json \ "oneOf"


      if (refKvP.isDefined && refKvP.get.isInstanceOf[JsString]) {
        Ref(refKvP.get.as[JsString].value)
      } else if (typeKvP.isDefined && typeKvP.get.isInstanceOf[JsString]) {
        typeKvP.get.as[JsString].value match {
          case "object" => ObjectType()
          case "array" => ArrayType()
          case x => SingleType(x)
        }
      } else if (oneOfKvP.isDefined && oneOfKvP.get.isInstanceOf[JsArray]) {
        val subTypes = oneOfKvP.get.asInstanceOf[JsArray].value.map(fromDefinition)
        EitherType(subTypes.toVector)
      } else {
        Skipped
      }
    }
  }

}
