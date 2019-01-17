package com.useoptic.common.spec_types

import com.useoptic.common.spec_types.reporting.{EndpointIssue, EndpointReport}
import play.api.libs.json._

import scala.util.Try

case class Endpoint(method: String,
                    url: String,
                    parameters: Vector[Parameter] = Vector(),
                    body: Option[RequestBody] = None,
                    responses: Vector[Response] = Vector(),
                    authentication: Option[String] = None,

                    issues: Vector[EndpointIssue] = Vector(),
                    report: EndpointReport = EndpointReport(0, Map())) extends ApiSpecificationComponent {

  require(EndpointValidation.allowedMethods.contains(method),
    s"Invalid HTTP Method ${method} is not one of ${EndpointValidation.allowedMethods.mkString(", ")}")

  def identifier: String = s"${method} ${url}"

  def id = Endpoint.id(method, url)

  def pathParameters: Vector[PathParameter] = Endpoint.pathParameters(url)

  def headerParameters: Vector[Parameter] = parameters.filter(_.in == "header")
  def cookieParameters: Vector[Parameter] = parameters.filter(_.in == "cookie")
  def queryParameters: Vector[Parameter] = parameters.filter(_.in == "query")
}

case class PathParameter(name: String) extends ApiSpecificationComponent

case class Parameter(in: String, name: String, required: Boolean = false, schema: JsObject) extends ApiSpecificationComponent {
  def schemaType: String = Try((schema \ "type").get.as[JsString].value).getOrElse("string")
}

case class RequestBody(contentType: String, schema: Option[JsObject]) extends ApiSpecificationComponent

case class Response(status: Int, headers: Vector[Parameter], contentType: Option[String], schema: Option[JsObject]) extends ApiSpecificationComponent {
  def isSuccessResponse = status >= 200 && status < 300
}


object EndpointValidation {
  val allowedMethods = Set("get", "post", "put", "delete", "options", "head")
  val pathRegex = ":([a-zA-Z][a-zA-Z0-9]{1,})".r
}

object Endpoint {
  def pathParameters(url: String) =
    EndpointValidation.pathRegex.findAllIn(url).matchData.toVector.map(i => {
      val paramName = i.group(1)
      val range = Range(i.start, i.end)

      PathParameter(paramName)
    })

  def id(method: String, path: String) = s"${method} ${path}"
}