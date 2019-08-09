package com.seamless.oas.export

import com.seamless.contexts.requests.Commands.{BodyDescriptor, ParameterizedPathComponentDescriptor, PathComponentDescriptor, ShapedBodyDescriptor}
import com.seamless.contexts.requests.{HttpRequest, HttpResponse}
import com.seamless.contexts.rfc.{InMemoryQueries, RfcService}
import com.seamless.oas.export.WriteSchemas._
import io.circe.Json

class OASExport(queries: InMemoryQueries, rfcService: RfcService, options: OASExportOptions = OASExportOptions()) {

  val jsonSchemaBuilder = new JsonSchemaBuilder(queries.shapesState, queries.namedShapes)
  val pathMapping: Vector[FullPath] = PathListProjection.fromEvents(rfcService.listEvents("id"))

  def requestForId(id: String) = {
    queries.requestsState.requests(id)
  }

  def absolutePathFromPath(pathId: String): String = {
    pathId
  }

  def responsesForRequest(requestId: String): Vector[HttpResponse] = {
    queries.requestsState.responses.collect {
      case (responseId, response) if response.responseDescriptor.requestId == requestId && !response.isRemoved  => response
    }.toVector.sortBy(_.responseDescriptor.httpStatusCode)
  }

  def getContributionOption(id: String, key: String) = queries.contributions.get(id, key)

  def bodyToOAS(bodyDescriptor: BodyDescriptor) = {
    bodyDescriptor match {
      case body: ShapedBodyDescriptor => Some(Body(body.httpContentType, Some(jsonSchemaBuilder.fromShapeId(body.shapeId).asJson)))
      case _ => None
    }
  }

  def operationFromRequest(request: HttpRequest): Operation = {

    val requestBody = bodyToOAS(request.requestDescriptor.bodyDescriptor)

    val operationId = getContributionOption(request.requestId, "oas.operationId").getOrElse(request.requestId)
    val summary = getContributionOption(request.requestId, "oas.operationId")
    val description = getContributionOption(request.requestId, "oas.operationId")

    val r = responsesForRequest(request.requestId)
    val responses = responsesForRequest(request.requestId).sortBy(_.responseDescriptor.httpStatusCode).map {
      case res => {
        val responseDescription = getContributionOption(res.responseId, "description")
        (res.responseDescriptor.httpStatusCode.toString, Response(responseDescription, bodyToOAS(res.responseDescriptor.bodyDescriptor)))
      }
    }

    Operation(operationId, summary, description, requestBody, responses)
  }


  def oasOperations = {

    def pathParametersForLeaf(id: String) = {
      val searchPaths = pathMapping.find(_.pathId == id).get._parentPathIds :+ id
      searchPaths.map(i => {
        queries.requestsState.pathComponents(i).descriptor
      }).collect {
        //hardcoding string for now
        case param: ParameterizedPathComponentDescriptor => PathParameter(param.name, Json.obj("type" -> Json.fromString("string")))
      }
    }

    val pathIdsWithRequests = queries.pathsWithRequests.values.toSet
    pathIdsWithRequests.map(pathId => Path( pathMapping.find(_.pathId == pathId).get.absolutePath , {
      queries.pathsWithRequests.collect { case i if i._2 == pathId && !requestForId(i._1).isRemoved =>
          val request = requestForId(i._1)
          request.requestDescriptor.httpMethod.toLowerCase -> operationFromRequest(request)
      }.toVector.sortBy(_._1).toMap
    }, pathParametersForLeaf(pathId)))
  }

  def fullOASDescription = {
    Json.obj(
      "openapi" -> Json.fromString("3.0.1"),
      "info" -> Json.obj(
        "title" -> Json.fromString(queries.apiName()),
        "version" -> Json.fromString(rfcService.listEvents("id").length.toString)
      ),
      "paths" -> Json.obj(
        oasOperations.toVector.sortBy(_.absolutePath).map(path => {
          path.absolutePath -> Json.obj(
            (path.operations.toVector.sortBy(_._1).map { case (k, v) => k -> v.toJson } :+ path.pathParametersToJson ):_*
          )
        }):_*
      ),
      "components" -> Json.obj(
        "schemas" -> Json.obj(
          jsonSchemaBuilder.sharedSchemas:_*
        )
      )
    )
  }
}
