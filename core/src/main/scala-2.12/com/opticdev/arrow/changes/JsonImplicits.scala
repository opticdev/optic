package com.opticdev.arrow.changes
import better.files.File
import com.opticdev.arrow.changes.location.{AsChildOf, Clipboard, InsertLocation, RawPosition}
import com.opticdev.arrow.graph.KnowledgeGraphImplicits.{DirectTransformation, TransformationChanges}
import com.opticdev.arrow.results.ModelOption
import com.opticdev.common.{PackageRef, SchemaRef, fileFormat}
import com.opticdev.core.sourcegear.sync.FilePatch
import com.opticdev.sdk.descriptions.transformation.Transformation
import com.opticdev.sdk.opticmarkdown2.schema.OMSchema
import play.api.libs.json._

import scala.util.{Failure, Success, Try}

object JsonImplicits {

  //SDK Objects refs
  import com.opticdev.sdk.descriptions.transformation.TransformationRef.transformationRefJsonFormats
  import PackageRef.packageRefJsonFormat
  import SchemaRef.schemaRefFormats
  import com.opticdev.sdk.opticmarkdown2.Serialization.omschemaFormat

  import com.opticdev.sdk.opticmarkdown2.Serialization._

  implicit val modelOptionsFormat = Json.format[ModelOption]

  //Location

  implicit val asChildOfFormat = Json.format[AsChildOf]
  implicit val rawPosition = Json.format[RawPosition]

  implicit val insertLocationFormat =  new Format[InsertLocation] {
    override def reads(json: JsValue): JsResult[InsertLocation] = {
      val fieldType = Try((json.as[JsObject] \ "type").get.as[JsString].value).getOrElse("")
      fieldType match {
        case "AsChildOf" => Json.fromJson[AsChildOf](json)
        case "RawPosition" => Json.fromJson[RawPosition](json)
        case "Clipboard" => JsSuccess(Clipboard)
        case other => JsError(s"""Location type '${fieldType}' not accepted""")
      }
    }
    override def writes(o: InsertLocation): JsValue = {
      o.asJson.as[JsObject] + ("type" -> JsString(o.getTypeField))
    }
  }

  //Insert Model
  implicit val insertModelFormat = Json.format[InsertModel]

  implicit val transformationFormat = Json.format[Transformation]
  implicit val gearOptionFormat = Json.format[LensOption]
  implicit val directTransformationFormat = Json.format[DirectTransformation]
  implicit val transformationChangesFormat = Json.format[TransformationChanges]

  //Run Transformation
  implicit val runTransformationFormat = Json.format[RunTransformation]

  //Raw Insert
  implicit val rawInsertFormat =  Json.format[RawInsert]

  //Clear Search Lines
  implicit val clearSearchLinesFormat = Json.format[ClearSearchLines]

  //Put Update
  implicit val putUpdateFormat = Json.format[PutUpdate]
  //File Contents Update
  implicit val fileContentsUpdateFormat = Json.format[FileContentsUpdate]

  implicit val opticChangeFormat = new Format[OpticChange] {
    override def reads(json: JsValue): JsResult[OpticChange] = {
      val fieldType = Try((json.as[JsObject] \ "type").get.as[JsString].value).getOrElse("")
      fieldType match {
        case "InsertModel" => Json.fromJson[InsertModel](json)
        case "RunTransformation" => Json.fromJson[RunTransformation](json)
        case "RawInsert" => Json.fromJson[RawInsert](json)
        case "ClearSearchLines" => Json.fromJson[ClearSearchLines](json)
        case "PutUpdate" => Json.fromJson[PutUpdate](json)
        case "FileContentsUpdate" => Json.fromJson[FileContentsUpdate](json)
        case other => JsError(s"""Change type '${fieldType}' not accepted""")
      }

    }
    override def writes(o: OpticChange): JsValue = {
      o.asJson.as[JsObject] + ("type" -> JsString(o.getTypeField))
    }
  }

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
