package com.useoptic.common.spec_types

import play.api.libs.json.{JsObject, JsString, JsValue}

import scala.util.Try

trait AuthenticationScheme

case object HTTPBasic extends AuthenticationScheme
case object HTTPBearer extends AuthenticationScheme
case class APIKey(in: String, name: String) extends AuthenticationScheme {
  require(Set("header", "cookie", "query").contains(in), "APIKey Auth 'in' field must be one of ['cookie', 'header', 'query']")
}

object Authentication {

  def fromJson(json: JsValue): Try[AuthenticationScheme] = Try {
    val t = (json.as[JsObject] \ "type").get.as[JsString].value
    t match {
      case "basic" => HTTPBasic
      case "bearer" => HTTPBearer
      case "apiKey" => {
        val in = Try((json.as[JsObject] \ "in").get.as[JsString].value)
        val name = Try((json.as[JsObject] \ "name").get.as[JsString].value)
        require(in.isSuccess && name.isSuccess, "APIKey Auth must have an 'in' and a 'name' field specified")
        APIKey(in.get, name.get)
      }
      case _ => throw new IllegalArgumentException("requirement failed: Auth definitions must be one of ['basic', 'bearer', 'apiKey']")
    }
  }

  def applyAuthToEndpoint(authPair: (String, AuthenticationScheme), endpoint: Endpoint): Endpoint = {
    val (name, authenticationScheme) = authPair

    def withoutAuthorizationHeader = endpoint.parameters.filterNot(i => i.in == "header" && i.name == "Authorization")
    authenticationScheme match {
      case HTTPBasic => endpoint.copy(parameters = withoutAuthorizationHeader, authentication = Some(name))
      case HTTPBearer => endpoint.copy(parameters = withoutAuthorizationHeader, authentication = Some(name))
      case APIKey(in, name) => endpoint.copy(parameters = endpoint.parameters.filterNot(i => i.in == in && i.name == name), authentication = Some(name))
    }
  }

}