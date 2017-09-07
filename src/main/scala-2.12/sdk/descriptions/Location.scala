package sdk.descriptions

import play.api.libs.json._
import sdk.descriptions.Finders.Finder
import sdk.descriptions.enums.LocationEnums
import sdk.descriptions.enums.LocationEnums.LocationTypeEnums

import scalax.collection.edge.LkDiEdge
import scalax.collection.mutable.Graph



object Location extends Description[Location] {

  implicit val locationReads = new Reads[Location] {
    override def reads(json: JsValue): JsResult[Location] = {
      try {
        JsSuccess(Location.fromJson(json))
      } catch {
        case _=> JsError()
      }
    }
  }

  override def fromJson(jsValue: JsValue): Location = {
    import LocationEnums._

    val componentType = jsValue \ "type" get
    val locationTypeEnum = Json.fromJson[LocationTypeEnums](componentType)

    Location(locationTypeEnum.get)
  }
}

case class Location(in: LocationTypeEnums)