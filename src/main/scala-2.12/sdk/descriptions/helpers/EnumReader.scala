package sdk.descriptions.helpers

import play.api.libs.json._

trait ParsableEnum extends Enumeration {
  val mapping : Map[String, Value]
}

object EnumReader {

  def forEnum(parsableEnum: ParsableEnum) = {
    new Reads[parsableEnum.Value] {
      override def reads(json: JsValue): JsResult[parsableEnum.Value] = {
        val map = parsableEnum.mapping
        val typeOption = map.get(json.as[JsString].value)
        if (typeOption.isDefined) JsSuccess(typeOption.get) else throw new Error(json + " is not a valid "+parsableEnum.getClass.getName)
      }
    }
  }
}
