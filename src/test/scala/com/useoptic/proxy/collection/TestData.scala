package com.useoptic.proxy.collection

import java.nio.charset.StandardCharsets

import com.useoptic.proxy.OpticAPIConfiguration
import com.useoptic.proxy.collection.url.TestHints
import play.api.libs.json.{JsValue, Json}
import scalaj.http.Base64

object TestData {

  object Body {
    def jsonBody(jsValue: JsValue): String = Base64.encodeString(jsValue.toString())
    def simpleBody: String = jsonBody(Json.obj("username" -> "testuser", "password" -> "testpassword"))
    def userBody: String = jsonBody(Json.obj("username" -> "testuser", "id" -> "myId", "email" -> "myemail", "friends" -> Vector("A", "B")))
  }

  object Headers {
    def contentType(value: String) = "Content-Type" -> value
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

  object Interactions {

    val testConfig = OpticAPIConfiguration("My Backend", Vector(TestHints.login), Vector(), Vector())

    val loginSuccess = APIInteraction(
      RawRequest("/login", "post", Some(Body.simpleBody), Vector("Content-Type" -> "application/json")),
      RawResponse(200, Vector("X-Csrf-Token" -> "yourAuthToken"), None)
    )

    val loginFallbackToCreationSuccess = APIInteraction(
      RawRequest("/login", "post", Some(Body.simpleBody), Vector("Content-Type" -> "application/json")),
      RawResponse(201, Vector("X-Csrf-Token" -> "yourAuthToken", "Content-Type" -> "application/json"), Some(Body.userBody))
    )

    val loginFailed = APIInteraction(
      RawRequest("/login", "post", Some(Body.simpleBody), Vector("Content-Type" -> "application/json")),
      RawResponse(401, Vector("Content-Type" -> "text/plain"), Some(Base64.encodeString("Invalid Login")))
    )

    val loginUserNotFound = APIInteraction(
      RawRequest("/login", "post", Some(Body.simpleBody), Vector("Content-Type" -> "application/json")),
      RawResponse(404, Vector("Content-Type" -> "text/plain"), Some(Base64.encodeString("User Not Found")))
    )
  }

}
