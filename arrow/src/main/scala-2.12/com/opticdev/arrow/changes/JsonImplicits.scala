package com.opticdev.arrow.changes
import better.files.File
import com.opticdev.arrow.changes.location.{AsChildOf, InsertLocation, RawPosition}
import com.opticdev.common.PackageRef
import com.opticdev.sdk.descriptions.SchemaRef
import play.api.libs.json._

import scala.util.{Failure, Success, Try}

object JsonImplicits {

  //SDK Objects refs
  implicit val packageRefFormat = Json.format[PackageRef]
  implicit val schemaRefFormat = Json.format[SchemaRef]


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
  implicit val insertModelFormat = Json.format[InsertModel]
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


}
