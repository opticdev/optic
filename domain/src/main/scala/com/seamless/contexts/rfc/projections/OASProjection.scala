package com.seamless.contexts.rfc.projections

import com.seamless.contexts.requests.Commands.{BodyDescriptor, ParameterizedPathComponentDescriptor, ShapedBodyDescriptor}
import com.seamless.contexts.requests.{Commands, HttpRequest, HttpResponse}
import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.contexts.rfc.{InMemoryQueries, RfcService, RfcServiceJSFacade, RfcState}
import com.seamless.contexts.shapes.ShapesHelper
import com.seamless.contexts.shapes.ShapesHelper.OptionalKind
import com.seamless.contexts.shapes.projections.{FlatShapeProjection, JsonSchemaProjection}
import com.seamless.ddd.{AggregateId, InMemoryEventStore}
import com.seamless.diff.RequestDiffer.UnmatchedQueryParameterShape
import com.seamless.diff.ShapeDiffer
import io.circe.Json
import io.circe.scalajs.{convertJsToJson, convertJsonToJs}

import scala.scalajs.js.annotation.{JSExport, JSExportAll}
import scala.scalajs.js

@JSExport
@JSExportAll
object OASProjectionHelper {
  def fromEventString(eventString: String): js.Any = {
    val eventStore = RfcServiceJSFacade.makeEventStore()
    eventStore.bulkAdd("id", eventString)
    val rfcService: RfcService = new RfcService(eventStore)
    val queries = new InMemoryQueries(eventStore, rfcService, "id")
    convertJsonToJs(new OASProjection(queries, rfcService, "id").generate)
  }
}

class OASProjection(queries: InMemoryQueries, rfcService: RfcService, aggregateId: AggregateId) {
  import OASDomain._

  lazy val rfcState = rfcService.currentState(aggregateId)

  lazy val sharedSchemaComponents = rfcState.shapesState.shapes.filter {
    case (k, shape) => !shape.isRemoved && shape.descriptor.name != "" && !ShapesHelper.allCoreShapes.exists(_.baseShapeId == k)
  }
  lazy val pathMapping: Vector[FullPath] = PathListProjection.fromEvents(rfcService.listEvents("id"))

  def bodyToOAS(bodyDescriptor: BodyDescriptor) = {
    bodyDescriptor match {
      case body: ShapedBodyDescriptor => Some(Body(body.httpContentType, Some(new JsonSchemaProjection(body.shapeId)(rfcState.shapesState).asJsonSchema(expand = false))))
      case _ => None
    }
  }

  def responsesForRequest(requestId: String): Vector[HttpResponse] = {
    queries.requestsState.responses.collect {
      case (responseId, response) if response.responseDescriptor.requestId == requestId && !response.isRemoved => response
    }.toVector.sortBy(_.responseDescriptor.httpStatusCode)
  }


  def getContributionOption(id: String, key: String) = queries.contributions.get(id, key)

  def operationFromRequest(request: HttpRequest): Operation = {

    val requestBody = bodyToOAS(request.requestDescriptor.bodyDescriptor)

    val operationId = getContributionOption(request.requestId, "oas.operationId").getOrElse(request.requestId)
    val summary = getContributionOption(request.requestId, "purpose")
    val description = getContributionOption(request.requestId, "description")

    val r = responsesForRequest(request.requestId)
    val responses = responsesForRequest(request.requestId).sortBy(_.responseDescriptor.httpStatusCode).map {
      case res => {
        val responseDescription = getContributionOption(res.responseId, "description")
        (res.responseDescriptor.httpStatusCode.toString, Response(responseDescription, bodyToOAS(res.responseDescriptor.bodyDescriptor)))
      }
    }

    val queryParamShape: Option[FlatShapeProjection.FlatShapeResult] = rfcState.requestsState.requestParameters.filter(x => {
      val (parameterId, parameter) = x
      parameter.requestParameterDescriptor.requestId == request.requestId && parameter.requestParameterDescriptor.location == "query"
    }).values.headOption.flatMap(query => {
      query.requestParameterDescriptor.shapeDescriptor match {
        case c: Commands.UnsetRequestParameterShapeDescriptor => {
          None
        }
        case c: Commands.ShapedRequestParameterShapeDescriptor => {
          Some(FlatShapeProjection.forShapeId(c.shapeId)(rfcState.shapesState))
        }
      }
    })


    Operation(operationId, summary, description, requestBody, queryParamShape, responses)
  }

  lazy val oasOperations = {

    def pathParametersForLeaf(id: String) = {
      val searchPaths = pathMapping.find(_.pathId == id).get._parentPathIds :+ id
      searchPaths.map(i => {
        queries.requestsState.pathComponents(i).descriptor
      }).collect {
        //hardcoding string for now
        case param: ParameterizedPathComponentDescriptor => PathParameter(param.name, Json.obj("type" -> Json.fromString("string")))
      }
    }

    def requestForId(id: String) = {
      queries.requestsState.requests(id)
    }

    val pathIdsWithRequests = queries.pathsWithRequests.values.toSet
    pathIdsWithRequests.map(pathId => Path(pathMapping.find(_.pathId == pathId).get.absolutePath, {
      queries.pathsWithRequests.collect { case i if i._2 == pathId && !requestForId(i._1).isRemoved =>
        val request = requestForId(i._1)
        request.requestDescriptor.httpMethod.toLowerCase -> operationFromRequest(request)
      }.toVector.sortBy(_._1).toMap
    }, pathParametersForLeaf(pathId)))
  }


  def generate: Json = {


    val sharedDefinitions = sharedSchemaComponents.map(i => {
      import com.seamless.contexts.shapes.projections.JsonSchemaHelpers._
      val name = i._2.descriptor.name
      name -> new JsonSchemaProjection(i._1)(rfcState.shapesState).asJsonSchema(expand = true)
    }).toSeq

    Json.obj(
      "openapi" -> Json.fromString("3.0.1"),
      "info" -> Json.obj(
        "title" -> Json.fromString(queries.apiName()),
        "version" -> Json.fromString(rfcService.listEvents("id").length.toString)
      ),
      "paths" -> Json.obj(
        oasOperations.toVector.sortBy(_.absolutePath).map(path => {
          path.absolutePath -> Json.obj(
            (path.operations.toVector.sortBy(_._1).map { case (k, v) => k -> v.toJson(rfcState) } :+ path.pathParametersToJson): _*
          )
        }): _*
      ),
      "components" -> Json.obj(
        "schemas" -> Json.obj(
          sharedDefinitions: _*
        )
      )
    )

  }


  object OASDomain {

    case class Path(absolutePath: String, operations: Map[String, Operation], pathParameters: Vector[PathParameter]) {
      def pathParametersToJson = {
        "parameters" -> Json.arr(pathParameters.sortBy(p => absolutePath.indexOf("{" + p + "}")).map(_.toJson): _*)
      }
    }

    case class Operation(operationId: String,
                         summary: Option[String],
                         description: Option[String],
                         requestBody: Option[Body],
                         query: Option[FlatShapeProjection.FlatShapeResult],
                         responses: Vector[(String, Response)]) {

      def toJson(rfcState: RfcState) = {
        var json = Json.obj().asObject.get
        json = json.add("operationId", Json.fromString(operationId))

        if (summary.isDefined && summary.get.nonEmpty) {
          json = json.add("summary", Json.fromString(summary.get))
        }
        if (description.isDefined && description.get.nonEmpty) {
          json = json.add("description", Json.fromString(description.get))
        }

        if (requestBody.isDefined) {
          json = json.add("requestBody", requestBody.get.toJson)
        }

        if (responses.nonEmpty) {
          json = json.add("responses", Json.obj(responses.map(i => (i._1, i._2.toJson)): _*))
        }

        if (query.isDefined && query.get.root.fields.nonEmpty) {
          val queryParameters = query.get.root.fields.map(i => {
            val innerOption = i.shape.links.get(OptionalKind.innerParam)
            if (innerOption.isDefined) {
              //is optional
              QueryParameter(i.fieldName, false, new JsonSchemaProjection(innerOption.get)(rfcState.shapesState).asJsonSchema(true), getContributionOption(i.fieldId, "description"))
            } else {
              //is required
              QueryParameter(i.fieldName, true, new JsonSchemaProjection(i.shape.id)(rfcState.shapesState).asJsonSchema(true), getContributionOption(i.fieldId, "description"))
            }
          })
          json = json.add("parameters", Json.arr(queryParameters.map(_.toJson):_*))
        }

        Json.fromJsonObject(json)
      }

    }

    case class Body(contentType: String, asJsonSchema: Option[Json]) {
      def toJson = {
        Json.obj(
          "content" -> Json.obj(
            contentType -> Json.obj(
              "schema" -> asJsonSchema.get
            )
          )
        )
      }
    }

    case class PathParameter(name: String, asJsonSchema: Json) {
      def toJson = {
        Json.obj(
          "in" -> Json.fromString("path"),
          "name" -> Json.fromString(name),
          "required" -> Json.fromBoolean(true),
          "schema" -> asJsonSchema
        )
      }
    }

    case class QueryParameter(name: String, required: Boolean, schema: Json, description: Option[String]) {
      def toJson = {
        var base = Json.obj(
          "in" -> Json.fromString("query"),
          "name" -> Json.fromString(name),
          "required" -> Json.fromBoolean(required),
          "schema" -> schema
        ).asObject.get

        if (description.isDefined) {
          base = base.add("description", Json.fromString(description.get))
        }

        Json.fromJsonObject(base)
      }
    }

    case class Response(description: Option[String], responseBody: Option[Body]) {
      def toJson = {
        val base = if (responseBody.isDefined) {
          responseBody.get.toJson
        } else {
          Json.obj()
        }
        Json.fromJsonObject(base.asObject.get.add("description", Json.fromString(description.getOrElse(""))))
      }
    }


  }

}

