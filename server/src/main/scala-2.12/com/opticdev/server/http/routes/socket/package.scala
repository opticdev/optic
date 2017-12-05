package com.opticdev.server.http.routes

import play.api.libs.json.{JsObject, JsString, JsValue}
import com.opticdev.server.data.ToJsonImplicits._
package object socket {
  trait OpticEvent {
    def asString: String = asJson.toString()
    def asJson: JsValue
  }

  case class ContextFound(filePath: String, range: Range, results: JsValue) extends OpticEvent {
    def asJson = JsObject(Seq("event"-> JsString("context-found"), "filePath" -> JsString(filePath), "range" -> range.toJson, "results"-> results))
  }

  case class Success() extends OpticEvent {
    def asJson = JsString("Success")
    override def asString = "Success"
  }

  case class ErrorResponse(error: String) extends OpticEvent {
    def asJson = JsString(error)
    override def asString = error
  }

}
