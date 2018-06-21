package com.opticdev.sdk.opticmarkdown2

import com.opticdev.common.SchemaRef
import com.opticdev.parsers.rules._
import com.opticdev.sdk.opticmarkdown2.lens._
import com.opticdev.sdk.opticmarkdown2.schema.OMSchema
import com.opticdev.sdk.opticmarkdown2.utils.EnumFormatsFromTypes
import play.api.libs.json._

object Serialization {
  import com.opticdev.common.PackageRef.packageRefJsonFormat
  import com.opticdev.common.SchemaRef.schemaRefFormats

  //Enums
  implicit lazy val omlensvariablescopeenumFormat = EnumFormatsFromTypes.newFormats[OMLensVariableScopeEnum](Map(
    "self" -> Self, "scope" -> Scope
  ))
  implicit lazy val omlenscomponenttypeFormat = EnumFormatsFromTypes.newFormats[OMLensComponentType](Map(
    "token" -> Token, "literal" -> Literal, "ObjectLiteral" -> ObjectLiteral
  ))
  implicit lazy val omchildrenruletypeFormat = EnumFormatsFromTypes.newFormats[OMChildrenRuleType](Map(
    "any" -> com.opticdev.parsers.rules.Any,
    "exact" -> Exact,
    "same-any-order" -> SameAnyOrder,
    "same-plus" -> SamePlus,
    "same-any-order-plus" -> SameAnyOrderPlus,
  ))

  //Shared
  implicit lazy val omrangeFormat = Json.format[OMRange]

  //Schema
  implicit lazy val omschemaFormat = Json.format[OMSchema]

  //Snippet
  implicit lazy val omsnippetFormat = Json.format[OMSnippet]

  //OMLens
  implicit lazy val omlensnodefinder = Json.format[OMLensNodeFinder]
  implicit lazy val omlenscodecomponentFormat = Json.format[OMLensCodeComponent]
  implicit lazy val omlensschemacomponentFormat = Json.format[OMLensSchemaComponent]

  implicit lazy val omlenscomponentFormat = new Format[OMLensComponent] {
    override def reads(json: JsValue): JsResult[OMLensComponent] = {
      json.as[JsObject].value.keySet match {
        case x if x == Set("type", "at") => Json.fromJson[OMLensCodeComponent](json)
        case x if x.contains("schemaRef") => Json.fromJson[OMLensSchemaComponent](json)
      }
    }
    override def writes(o: OMLensComponent): JsValue = {
      o match {
        case l: OMLensCodeComponent => Json.toJson[OMLensCodeComponent](l)
        case s: OMLensSchemaComponent => Json.toJson[OMLensSchemaComponent](s)
      }
    }
  }

  implicit lazy val omschemaeither = new Format[Either[SchemaRef, OMSchema]] {
    override def writes(o: Either[SchemaRef, OMSchema]): JsValue = {
      if (o.isLeft) {
        JsString(o.left.get.full)
      } else {
        Json.toJson[OMSchema](o.right.get)
      }
    }

    override def reads(json: JsValue): JsResult[Either[SchemaRef, OMSchema]] = {
      json match {
        case JsString(s) => JsSuccess(Left(SchemaRef.fromString(s).get))
        case obj: JsObject => JsSuccess(Right(Json.fromJson[OMSchema](obj).get))
      }
    }
  }

  implicit lazy val omlensFormat = Json.format[OMLens]

}
