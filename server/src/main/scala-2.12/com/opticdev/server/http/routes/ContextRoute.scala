package com.opticdev.server.http.routes

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives.{complete, parameters, path, pathEnd, pathPrefix}
import com.opticdev.server.http.HTTPResponse
import com.opticdev.server.http.routes.query.ModelQuery
import com.opticdev.server.state.ProjectsManager
import play.api.libs.json.{JsArray, JsString}
import akka.http.scaladsl.marshalling.ToResponseMarshallable
import akka.http.scaladsl.model.{StatusCode, StatusCodes}
import akka.http.scaladsl.unmarshalling.Unmarshal

import scala.concurrent.ExecutionContext
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.StandardRoute
import better.files.File
import com.opticdev.server.http.HTTPResponse
import com.opticdev.server.http.controllers.ContextQuery
import com.opticdev.server.http.routes.query.ModelQuery
import com.opticdev.server.state.ProjectsManager
import play.api.libs.json.{JsArray, JsValue}
import de.heikoseeberger.akkahttpplayjson.PlayJsonSupport._

import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success}

class ContextRoute(implicit executionContext: ExecutionContext, projectsManager: ProjectsManager) {

  val route =
    path("context") {
        parameters("file", "start".as[Int], "end".as[Int]) { (file, start, end) => {
          onComplete(contextQuery(file, Range(start, end))) {
            case Success(value) => complete(value.statusCode, value.data)
            case Failure(ex)    => complete(StatusCodes.InternalServerError, JsString(s"An error occurred: ${ex.getMessage}"))
          }
        }
      }
    }


  def contextQuery(file: String, range: Range) = new ContextQuery(File(file), range, None).executeToApiResponse
}
