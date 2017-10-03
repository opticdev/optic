package com.opticdev.server.http.routes

import akka.http.scaladsl.marshalling.ToResponseMarshallable
import akka.http.scaladsl.model.{StatusCode, StatusCodes}
import akka.http.scaladsl.unmarshalling.Unmarshal

import scala.concurrent.ExecutionContext
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.StandardRoute
import com.opticdev.HTTPResponse
import com.opticdev.server.http.routes.query.ModelQuery
import com.opticdev.server.http.state.StateManager
import play.api.libs.json.{JsArray, JsValue}
import de.heikoseeberger.akkahttpplayjson.PlayJsonSupport._

class ProjectsRoute(implicit executionContext: ExecutionContext, stateManager: StateManager) {


  val route =
    pathPrefix("projects") {
      pathEnd {
        complete(JsArray(stateManager.allProjects.toVector.map(_.asJson)))
      } ~
        path(Segment) { projectName => complete(getProject(projectName)) } ~
        path(Segment / "models" / Segment) {
          (projectName, modelType) => {
            parameters('filter.?) { (filterStringOption) =>
              val filter = if (filterStringOption.isDefined) ModelQuery.fromString(filterStringOption.get) else ModelQuery()
              complete(getModelsForProject(projectName, modelType, filter))
            }
          }
        }
  }


  def getProject(projectName: String) : HTTPResponse = {
    val projectOption = stateManager.lookupProject(projectName)
    if (projectOption.isDefined) projectOption.get.asJson
    else StatusCodes.NotFound
  }

  def getModelsForProject(projectName: String, modelName: String, filter: ModelQuery) : HTTPResponse = {
    val projectOption = stateManager.lookupProject(projectName)
    if (projectOption.isDefined) {
      JsArray()
    } else StatusCodes.NotFound
  }

}
