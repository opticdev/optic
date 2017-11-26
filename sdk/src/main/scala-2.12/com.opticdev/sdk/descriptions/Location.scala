package com.opticdev.sdk.descriptions

import com.opticdev.sdk.descriptions.enums.LocationEnums.LocationTypeEnums
import play.api.libs.json._

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph



object Location extends Description[Location] {

  implicit val locationReads = new Reads[Location] {
    override def reads(json: JsValue): JsResult[Location] = {
      try {
        JsSuccess(Location.fromJson(json))
      } catch {
        case _ : Throwable => JsError()
      }
    }
  }

  override def fromJson(jsValue: JsValue): Location = {
    import com.opticdev.sdk.descriptions.enums.LocationEnums._

    val componentType = jsValue \ "type" get
    val locationTypeEnum = Json.fromJson[LocationTypeEnums](componentType)

    Location(locationTypeEnum.get)
  }
}

case class Location(in: LocationTypeEnums)