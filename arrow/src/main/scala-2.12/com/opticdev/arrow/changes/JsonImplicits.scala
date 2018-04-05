package com.opticdev.arrow.changes
import better.files.File
import com.opticdev.arrow.changes.location.{AsChildOf, InsertLocation, RawPosition}
import com.opticdev.arrow.graph.KnowledgeGraphImplicits.{DirectTransformation, TransformationChanges}
import com.opticdev.arrow.results.ModelOption
import com.opticdev.common.PackageRef
import com.opticdev.sdk.descriptions.transformation.Transformation
import com.opticdev.sdk.descriptions.{Schema, SchemaRef}
import play.api.libs.json._

import scala.util.{Failure, Success, Try}

object JsonImplicits {

  //SDK Objects refs
  import PackageRef.packageRefJsonFormat
  import SchemaRef.schemaRefFormats



  implicit val schemaFormat = new Format[Schema] {
    override def reads(json: JsValue) = {
      val schemaJson = json.as[JsObject]
      val schemaRef = SchemaRef.fromString((schemaJson \ "_identifier").get.as[JsString].value)
      val schema = Schema(schemaRef.get, schemaJson - "_identifier")
      JsSuccess(schema)
    }

    override def writes(o: Schema) = o.toJson
  }

  //File
  implicit val fileFormat = new Format[File] {
    override def reads(json: JsValue) = {
      JsSuccess(Try(File(json.as[JsString].value)).get)
    }

    override def writes(o: File) = {
      JsString(o.pathAsString)
    }
  }

  implicit val modelOptionsFormat = Json.format[ModelOption]

  //Location

  implicit val asChildOfFormat = Json.format[AsChildOf]
  implicit val rawPosition = Json.format[RawPosition]

  implicit val insertLocationFormat = Json.format[InsertLocation]

  //Insert Model
  implicit val insertModelFormat = Json.format[InsertModel]

  implicit val transformationFormat = Json.format[Transformation]
  implicit val gearOptionFormat = Json.format[GearOption]
  implicit val directTransformationFormat = Json.format[DirectTransformation]
  implicit val transformationChangesFormat = Json.format[TransformationChanges]

  //Run Transformation
  implicit val runTransformationFormat = Json.format[RunTransformation]

  //Raw Insert
  implicit val rawInsertFormat =  Json.format[RawInsert]

  //Clear Search Lines
  implicit val clearSearchLinesFormat = Json.format[ClearSearchLines]

  implicit val opticChangeFormat = Json.format[OpticChange]

  implicit val changeGroupFormat = new Format[ChangeGroup] {
    override def reads(json: JsValue) = {
      val result = json.as[JsArray].value.map(i=> {
        val parsed = Json.fromJson[OpticChange](i)
        if (parsed.isError) {
          println(parsed)
        }
        parsed.get
      })
      JsSuccess(ChangeGroup(result:_*))
    }

    override def writes(o: ChangeGroup) = {
      JsArray(o.changes.map(_.asJson))
    }
  }

}
