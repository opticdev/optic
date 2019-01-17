package com.useoptic.proxy.collection

import java.nio.charset.StandardCharsets

import akka.http.scaladsl.model.{ContentTypes, HttpEntity}
import com.useoptic.proxy.{OpticAPIConfiguration}
import com.useoptic.proxy.collection.url.TestHints
import play.api.libs.json.{JsValue, Json}

object TestData {

  object Body {
    def jsonBody(jsValue: JsValue): HttpEntity = HttpEntity(ContentTypes.`application/json`, jsValue.toString())

    def simpleBody = jsonBody(Json.obj("username" -> "testuser", "password" -> "testpassword"))
    def userBody = jsonBody(Json.obj("username" -> "testuser", "id" -> "myId", "email" -> "myemail", "friends" -> Vector("A", "B")))
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

    val testConfig = OpticAPIConfiguration("My Backend", "npm run test", "localhost", 2000, Vector(TestHints.login), None)

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
      RawResponse(401, Vector("Content-Type" -> "text/plain"), Some("Invalid Login"))
    )

    val loginUserNotFound = APIInteraction(
      RawRequest("/login", "post", Some(Body.simpleBody), Vector("Content-Type" -> "application/json")),
      RawResponse(404, Vector("Content-Type" -> "text/plain"), Some("User Not Found"))
    )
  }

}
