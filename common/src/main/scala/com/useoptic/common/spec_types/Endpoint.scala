package com.useoptic.common.spec_types

import play.api.libs.json._

case class Endpoint(method: String,
                    url: String,
                    parameters: Vector[Parameter] = Vector(),
                    body: Option[RequestBody] = None,
                    responses: Vector[Response] = Vector(),
                    name: Option[String] = None,
                    authentication: Option[String] = None) extends ApiSpecificationComponent {

  require(EndpointValidation.allowedMethods.contains(method),
    s"Invalid HTTP Method ${method} is not one of ${EndpointValidation.allowedMethods.mkString(", ")}")

  def identifier: String = s"${method} ${url}"

  def pathParameters: Vector[PathParameter] = Endpoint.pathParameters(url)

  def headerParameters: Vector[Parameter] = parameters.filter(_.in == "header")
  def cookieParameters: Vector[Parameter] = parameters.filter(_.in == "cookie")
  def queryParameters: Vector[Parameter] = parameters.filter(_.in == "query")

  override def issues: Vector[ApiIssue] = {
    (if (responses.isEmpty) Vector(NoResponses(identifier)) else Vector()) ++
    (if (body.isDefined) body.get.issues else Vector()) ++
    parameters.flatMap(_.issues) ++
    responses.flatMap(_.issues)
  }
}

case class PathParameter(name: String) extends ApiSpecificationComponent {
  override def issues: Vector[ApiIssue] = Vector()
  def identifier: String = s"path-parameter.${name}"
}

case class Parameter(in: String, name: String, required: Boolean = false, schema: JsObject) extends ApiSpecificationComponent {
  override def issues: Vector[ApiIssue] = Vector()
  def identifier: String = s"${in}.${name}"
  def schemaType = (schema \ "type").as[JsString].value
}

case class RequestBody(contentType: String, schema: Option[JsObject]) extends ApiSpecificationComponent {
  override def issues: Vector[ApiIssue] = Vector() //{
//    (if (schema.isEmpty) Vector(RequestBodyWithoutSchema(identifier)) else Vector()) ++
//    (if (schema.nonEmpty && `Content-Type`.isEmpty) Vector(RequestBodyWithoutContentType(identifier)) else Vector())
//  }
  def identifier: String = s"body"
}

case class Response(status: Int, headers: Vector[Parameter], contentType: Option[String], schema: Option[JsObject]) extends ApiSpecificationComponent {
  override def issues: Vector[ApiIssue] = {
    (if (schema.isEmpty) Vector(ResponseBodyWithoutSchema(identifier)) else Vector()) ++
    (if (schema.nonEmpty && contentType.isEmpty) Vector(ResponseBodyWithoutContentType(identifier)) else Vector())
  }

  def isSuccessResponse = status >= 200 && status < 300

  override def identifier: String = status.toString
}


object EndpointValidation {
  val allowedMethods = Set("get", "post", "put", "delete", "options", "head")
  val pathRegex = ":([a-zA-Z][a-zA-Z0-9]{1,})".r
}

object Endpoint {
  implicit val parameterFormats = Json.using[Json.WithDefaultValues].format[Parameter]
  implicit val responsesFormats = Json.using[Json.WithDefaultValues].format[Response]
  implicit val requestBodyFormats = Json.using[Json.WithDefaultValues].format[RequestBody]
  implicit val endpointFormats = Json.using[Json.WithDefaultValues].format[Endpoint]

  def fromJson(jsValue: JsValue, nameOption: Option[String]): JsResult[Endpoint] =
    Json.fromJson[Endpoint](jsValue)
        .map(_.copy(name = nameOption))

  def pathParameters(url: String) =
    EndpointValidation.pathRegex.findAllIn(url).matchData.toVector.map(i => {
      val paramName = i.group(1)
      val range = Range(i.start, i.end)

      PathParameter(paramName)
    })

}