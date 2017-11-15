package com.opticdev.server.http.routes

package object socket {
  trait OpticEvent {
    def asString: String
  }

  case class Success() extends OpticEvent {
    def asString = "Success"
  }

  case class ErrorResponse(error: String) extends OpticEvent {
    override def asString: String = error
  }

}
