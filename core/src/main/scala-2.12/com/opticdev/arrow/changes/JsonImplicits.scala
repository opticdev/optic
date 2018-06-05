package com.opticdev.arrow.changes
import better.files.File
import com.opticdev.arrow.changes.location.{AsChildOf, InsertLocation, RawPosition}
import com.opticdev.arrow.graph.KnowledgeGraphImplicits.{DirectTransformation, TransformationChanges}
import com.opticdev.arrow.results.ModelOption
import com.opticdev.common.PackageRef
import com.opticdev.core.sourcegear.sync.FilePatch
import com.opticdev.sdk.descriptions.transformation.Transformation
import com.opticdev.sdk.descriptions.{Schema, SchemaRef}
import play.api.libs.json._
import com.opticdev.common.fileFormat
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

  implicit val modelOptionsFormat = Json.format[ModelOption]

  //Location

  implicit val asChildOfFormat = Json.format[AsChildOf]
  implicit val rawPosition = Json.format[RawPosition]

  implicit val insertLocationFormat = Json.format[InsertLocation]

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
