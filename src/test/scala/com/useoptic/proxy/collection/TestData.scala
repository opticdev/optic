package com.useoptic.proxy.collection

import java.nio.charset.StandardCharsets

import play.api.libs.json.{JsValue, Json}
import scalaj.http.Base64

object TestData {

  object Body {
    def jsonBody(jsValue: JsValue): String = Base64.encodeString(jsValue.toString())
    def simpleBody: String = jsonBody(Json.obj("username" -> "testuser", "password" -> "testpassword"))
  }

  object Headers {
    def contentType(value: String) = "Content-type" -> value
  }

  object Methods {
    val GET = "get"
    val POST = "post"
    val PUT = "put"
    val DELETE = "delete"
    val OPTIONS = "options"
    val HEAD = "head"
    val CONNECT = "connect"
    val TRACE = "trace"
  }

}
