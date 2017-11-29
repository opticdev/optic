package com.opticdev.server

import akka.http.scaladsl.model.StatusCode
import play.api.libs.json.JsValue

package object data {
  case class APIResponse(statusCode: StatusCode, data: JsValue)
}
