package com.opticdev.server.http.routes

import akka.http.scaladsl.server.Directives.{path, _}
import akka.http.scaladsl.server.Route
import com.opticdev.server.state.ProjectsManager
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.marshalling.ToResponseMarshallable
import akka.http.scaladsl.model.{StatusCode, StatusCodes}
import akka.http.scaladsl.unmarshalling.Unmarshal

import scala.concurrent.ExecutionContext
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.{Route, StandardRoute}
import com.opticdev.server.http.HTTPResponse
import com.opticdev.server.http.controllers.PutUpdate
import com.opticdev.server.http.routes.query.ModelQuery
import com.opticdev.server.state.ProjectsManager
import play.api.libs.json.{JsArray, JsObject, JsString, JsValue}
import de.heikoseeberger.akkahttpplayjson.PlayJsonSupport._

import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success}

class PutUpdateRoute(implicit executionContext: ExecutionContext, projectsManager: ProjectsManager) {

  val route: Route =
    path("models" / Segment) { (modelId) => {
      put {
        entity(as[JsObject]) { json =>
          onComplete(new PutUpdate(modelId, json).executeToApiResponse) {
            case Success(value) => complete(value.statusCode, value.data)
            case Failure(ex)    => complete(StatusCodes.InternalServerError, JsString(s"An error occurred: ${ex.getMessage}"))
          }
        }
      }
    }}

}