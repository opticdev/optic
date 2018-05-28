package com.opticdev.server.http.routes

import play.api.libs.json.{JsObject, JsString, JsValue}
import com.opticdev.server.data.ToJsonImplicits._
import com.opticdev.server.http.routes.socket.agents.Protocol.UpdateAgentEvent
package object socket {
  trait OpticEvent {
    def asString: String = asJson.toString()
    def asJson: JsValue
  }

  case class Success() extends OpticEvent {
    def asJson = JsString("Success")
    override def asString = "Success"
  }

  case class ErrorResponse(error: String) extends OpticEvent {
    def asJson = JsString(error)
    override def asString = error
  }

  case class SocketRouteOptions(autorefreshes: Boolean)

}