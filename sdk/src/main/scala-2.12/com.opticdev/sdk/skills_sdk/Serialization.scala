package com.opticdev.sdk.skills_sdk

import com.opticdev.common.SchemaRef
import com.opticdev.sdk.rules._
import com.opticdev.sdk.descriptions.enums.FinderEnums.{Containing, Entire, Starting, StringEnums}
import com.opticdev.sdk.skills_sdk.lens._
import com.opticdev.sdk.skills_sdk.schema.OMSchema
import com.opticdev.sdk.skills_sdk.utils.EnumFormatsFromTypes
import play.api.libs.json.{Json, _}
import play.api.libs.json._
import play.api.libs.functional.syntax._

import scala.util.Random

object Serialization {
  import com.opticdev.common.PackageRef.packageRefJsonFormat
  import com.opticdev.common.SchemaRef.schemaRefFormats

  //Enums
  implicit lazy val omlensvariablescopeenumFormat = EnumFormatsFromTypes.newFormats[OMLensVariableScopeEnum](Map(
    "self" -> Self, "scope" -> Scope
  ))
  implicit lazy val omlenscomponenttypeFormat = EnumFormatsFromTypes.newFormats[OMLensComponentType](Map(
    "token" -> Token, "literal" -> Literal, "object-literal" -> ObjectLiteral, "array-literal" -> ArrayLiteral
  ))

  implicit lazy val omassignmentOperationsFormat = EnumFormatsFromTypes.newFormats[AssignmentOperations](Map(
    "set-value" -> SetValue,
    "append-items" -> AppendItems,
    "append-items-unique" -> AppendItemsUnique,
    "prepend-items" -> PrependItems,
    "prepend-items-unique" -> PrependItemsUnique,
  ))

  implicit lazy val computedFieldFunctionFormat = EnumFormatsFromTypes.newFormats[ComputedFieldFunction](Map(
    "concat-strings" -> ConcatStrings
  ))

  implicit lazy val omchildrenruletypeFormat = EnumFormatsFromTypes.newFormats[OMChildrenRuleType](Map(
    "any" -> com.opticdev.sdk.rules.Any,
    "exact" -> Exact,
    "same-any-order" -> SameAnyOrder,
    "same-plus" -> SamePlus,
    "same-any-order-plus" -> SameAnyOrderPlus,
  ))

  implicit lazy val stringfindersenumtypeFormat = EnumFormatsFromTypes.newFormats[StringEnums](Map(
    "entire" -> Entire,
    "containing" -> Containing,
    "starting" -> Starting
  ))

  //Shared
  implicit lazy val omrangeFormat = Json.format[OMRange]

  //Schema
  implicit lazy val omschemaFormat = Json.using[Json.WithDefaultValues].format[OMSchema]

  //Snippet
  implicit lazy val omsnippetFormat = Json.format[OMSnippet]

  //OMLens
  implicit lazy val omlensnodefinder = Json.format[OMLensNodeFinder]
  implicit lazy val omlensstringfinder = Json.format[OMStringFinder]
  implicit lazy val omlensrangefinder = Json.format[OMRangeFinder]

  implicit lazy val omfinderFormat = new Format[OMFinder] {
    override def writes(o: OMFinder): JsValue = o match {
      case nf: OMLensNodeFinder=> Json.toJson[OMLensNodeFinder](nf)
    }
    override def reads(json: JsValue): JsResult[OMFinder] = {
      Json.fromJson[OMLensNodeFinder](json)
    }
  }

  implicit lazy val omlenscodecomponentFormat = Json.format[OMLensCodeComponent]
  implicit lazy val omlensassignmentcomponentFormats = Json.using[Json.WithDefaultValues].format[OMLensAssignmentComponent]
  implicit lazy val omlensschemacomponentFormat = Json.using[Json.WithDefaultValues].format[OMLensSchemaComponent]


  implicit lazy val omlenscomputedfieldReads: Reads[OMLensComputedFieldComponent] = (
      (__ \ 'subcomponents).lazyRead[Seq[OMLensComponent]](Reads.seq[OMLensComponent](omlenscomponentFormat)).map(_.toVector) and
      ( __ \ 'fieldProcessor).read[ComputedFieldFunction](computedFieldFunctionFormat) and
      ( __ \ 'enforceUniqueArguments).read[Boolean] and
      ( __ \ 'identifier).readWithDefault[String](Random.alphanumeric.take(9).mkString)
    )(OMLensComputedFieldComponent.apply _)

  implicit lazy val omlenscomponentFormat = new Format[OMLensComponent] {
    override def reads(json: JsValue): JsResult[OMLensComponent] = {
      json.as[JsObject].value.keySet match {
        case x if x == Set("type", "at") => Json.fromJson[OMLensCodeComponent](json)
        case x if x == Set("fieldProcessor", "subcomponents", "enforceUniqueArguments") => Json.fromJson[OMLensComputedFieldComponent](json)
        case x if x.contains("schemaRef") => Json.fromJson[OMLensSchemaComponent](json)
        case x if x.contains("tokenAt") && x.contains("keyPath") => Json.fromJson[OMLensAssignmentComponent](json)
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

  implicit lazy val omlensFormat = Json.using[Json.WithDefaultValues].format[OMLens]

  implicit val omcomponentwithpropertypathFormats = Json.format[OMComponentWithPropertyPath[OMLensCodeComponent]]
}
