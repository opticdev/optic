package sdk

import play.api.libs.json.{JsArray, JsObject, JsValue, Json}
import sdk.descriptions.Schema

object SdkDescription {
  def fromJson(jsValue: JsValue): SdkDescription = {
    try {
      val schemasJson = (jsValue \ "schemas").get.as[JsObject]
      val schemas = schemasJson.value.values.map(i=> new Schema(i.as[JsObject])).toVector

      val lensesJson = (jsValue \ "lenses").get.as[JsArray]

      SdkDescription(schemas)
    } catch {
      case _=> throw new Error("Invalid Sdk Description")
    }
  }
}

case class SdkDescription(schemas: Vector[Schema])
