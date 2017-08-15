package sdk.descriptions

import play.api.libs.json.JsValue

trait Description[A] {
  def fromJson(jsValue: JsValue) : A
}
