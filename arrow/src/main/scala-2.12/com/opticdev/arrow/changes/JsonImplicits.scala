package com.opticdev.arrow.changes
import better.files.File
import com.opticdev.arrow.changes.location.{AsChildOf, InsertLocation, RawPosition}
import com.opticdev.common.PackageRef
import com.opticdev.sdk.descriptions.{Schema, SchemaRef}
import play.api.libs.json._

import scala.util.{Failure, Success, Try}

object JsonImplicits {

  //SDK Objects refs
  import PackageRef.packageRefJsonFormat
  import SchemaRef.schemaRefFormats


  //File
  implicit val fileFormat = new Format[File] {
    override def reads(json: JsValue) = {
      JsSuccess(Try(File(json.as[JsString].value)).get)
    }

    override def writes(o: File) = {
      JsString(o.pathAsString)
    }
  }

  //Location
  implicit val asChildOfFormat = Json.format[AsChildOf]
  implicit val rawPosition = Json.format[RawPosition]


  implicit val insertLocationFormat = new Format[InsertLocation] {

    override def reads(json: JsValue) = {
      val locationType = (json.as[JsObject] \ "type").get.as[JsString].value
      locationType match {
        case "raw-position" => Json.fromJson[RawPosition](json)
        case "as-child-of" => Json.fromJson[AsChildOf](json)
      }
    }

    override def writes(o: InsertLocation) = {
      o match {
        case a: RawPosition => Json.toJsObject[RawPosition](a) ++ JsObject(Seq("type" -> JsString("raw-position")))
        case a: AsChildOf => Json.toJsObject[AsChildOf](a) ++ JsObject(Seq("type" -> JsString("as-child-of")))
      }
    }
  }



  //Insert Model
  implicit val insertModelFormat = new OFormat[InsertModel] {
    override def writes(o: InsertModel) : JsObject = {
      JsObject(Seq(
        "schema" -> o.schema.toJson,
        "value" -> o.value,
        "gearId" -> Try(JsString(o.gearId.get)).getOrElse(JsNull),
        "atLocation" -> Json.toJson[InsertLocation](o.atLocation)
      ))
    }

    override def reads(json: JsValue) = {
      val schemaJson = (json \ "schema").get.as[JsObject]
      val schemaRef = SchemaRef.fromString((schemaJson \ "_identifier").get.as[JsString].value)
      val schema = Schema(schemaRef.get, schemaJson - "_identifier")

      val value = (json \ "value").get.as[JsObject]

      val gearId = Try(Some((json \ "gearId").get.as[JsString].value)).getOrElse(None)

      val atLocation = Json.fromJson[InsertLocation]((json \ "atLocation").get).get

      JsSuccess(InsertModel(schema, gearId, value, atLocation))
    }
  }
  //Raw Insert
  implicit val rawInsertFormat = Json.format[RawInsert]


  implicit val opticChangeFormat = new Format[OpticChange] {

    override def reads(json: JsValue) = {
      val changeType = (json.as[JsObject] \ "type").get.as[JsString].value
      changeType match {
        case "insert-model" => Json.fromJson[InsertModel](json)
        case "raw-insert" => Json.fromJson[RawInsert](json)
        case _ => throw new Error(s"Optic change type ${changeType} not implemented")
      }
    }

    override def writes(o: OpticChange) = {
      o match {
        case a: InsertModel => Json.toJsObject[InsertModel](a) ++ JsObject(Seq("type" -> JsString("insert-model")))
        case a: RawInsert => Json.toJsObject[RawInsert](a) ++ JsObject(Seq("type" -> JsString("raw-insert")))
        case _ => throw new Error(s"Optic change type ${o.getClass.toString} not implemented")
      }
    }
  }


  implicit val changeGroupFormat = new Format[ChangeGroup] {
    override def reads(json: JsValue) = {
      val result = json.as[JsArray].value.map(i=> Json.fromJson[OpticChange](i).get)
      JsSuccess(ChangeGroup(result:_*))
    }

    override def writes(o: ChangeGroup) = {
      JsArray(o.changes.map(_.asJson))
    }
  }

}
