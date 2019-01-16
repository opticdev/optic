package com.useoptic.common.spec_types

import com.useoptic.utils.StringBuilderImplicits._
import play.api.libs.json.{JsArray, JsObject, JsString, Json}

case class OpticAPISpec(description: APIDescription, endpoints: Vector[Endpoint], authenticationSchemes: Map[String, AuthenticationScheme]) {

  def toSwagger: JsObject = OpticAPISpec.specToSwagger(this)

}

object OpticAPISpec {

  case class SwaggerPath(method: String, path: String, parameters: Vector[SwaggerParam], requestBody: Option[SwaggerRequestBody], responses: Map[String, SwaggerResponse], security: Map[String, JsArray])
  case class SwaggerRequestBody(content: Map[String, JsObject])
  case class SwaggerResponse(content: Map[String, JsObject])
  case class SwaggerParam(name: String, in: String, required: Boolean, schema: JsObject)

  implicit val writesRequestBody = Json.writes[SwaggerRequestBody]
  implicit val writesResponseBody = Json.writes[SwaggerResponse]
  implicit val writesSwaggerParam = Json.writes[SwaggerParam]
  implicit val writesSwaggerPath = Json.writes[SwaggerPath].transform((value: JsObject) => value - "method" - "path")

  def specToSwagger(opticAPISpec: OpticAPISpec): JsObject = {
    val securitySchemes: Map[String, JsObject] = authToSwagger(opticAPISpec.authenticationSchemes)
    val paths = opticAPISpec.endpoints.map(endpointToSwagger)
    val groupedPaths = paths.groupBy(_.path)

    val pathsAsJson = JsObject(groupedPaths.map {
      case (path, operations) => {
        path -> JsObject(operations.map(i => i.method -> Json.toJson[SwaggerPath](i)))
      }
    })

    Json.obj(
      "openapi" -> "3.0.0",
      "paths" -> pathsAsJson,
      "components" -> Json.obj("securitySchemes" -> securitySchemes)
    )
  }

  def endpointToSwagger(endpoint: Endpoint) = {
    val updatedUrl = urlToSwagger(endpoint.url, endpoint.pathParameters)
    val swaggerParams = endpoint.pathParameters.map(i => SwaggerParam(i.name, "path", true, JsObject(Seq("type" -> JsString("string"))))) ++ endpoint.parameters.map(parameterToSwagger)
    val requestBody = endpoint.body.map(bodyToSwagger)
    val responses = endpoint.responses.map(i => i.status.toString -> responseToSwagger(i)).toMap

    val security: Map[String, JsArray] = if (endpoint.authentication.isDefined) Map(endpoint.authentication.get -> JsArray.empty) else Map()

    SwaggerPath(endpoint.method, updatedUrl, swaggerParams, requestBody, responses, security)
  }

  def urlToSwagger(url: String, pathParameters: Vector[PathParameter]) = {
//    val lastToFirst = pathParameters.sortBy(_.at.end).reverse
//    val urlBuilder = new StringBuilder(url)
//    lastToFirst.foreach(i => urlBuilder.updateRange(i.at, s"""{${i.name}}"""))
//    urlBuilder.mkString
    ""
  }

  def parameterToSwagger(parameter: Parameter) =
    SwaggerParam(parameter.name, parameter.in, parameter.required, parameter.schema)

  def bodyToSwagger(requestBody: RequestBody) =
    SwaggerRequestBody(Map(requestBody.contentType -> requestBody.schema.getOrElse(JsObject.empty)))

  def responseToSwagger(response: Response) =
    SwaggerResponse(Map(response.contentType.getOrElse("application/json") -> response.schema.getOrElse(JsObject.empty)))

  def authToSwagger(authenticationSchemes: Map[String, AuthenticationScheme]) = {
    authenticationSchemes.map {
      case (name, value) => {
        value match {
          case HTTPBasic => name -> Json.obj("type" -> "http", "scheme" -> "basic")
          case HTTPBearer => name -> Json.obj("type" -> "http", "scheme" -> "bearer")
          case APIKey(in, paramName) => name -> Json.obj("type" -> "apiKey", "in" -> in, "name" -> paramName)
        }
      }
    }
  }

}