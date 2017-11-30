package com.opticdev.server.http.routes

import akka.http.scaladsl.marshalling.ToResponseMarshallable
import akka.http.scaladsl.model.{StatusCode, StatusCodes}
import akka.http.scaladsl.unmarshalling.Unmarshal

import scala.concurrent.ExecutionContext
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.StandardRoute
import com.opticdev.server.http.HTTPResponse
import com.opticdev.server.http.routes.query.ModelQuery
import com.opticdev.server.state.ProjectsManager
import play.api.libs.json.{JsArray, JsValue}
import de.heikoseeberger.akkahttpplayjson.PlayJsonSupport._

class ProjectRoute(implicit executionContext: ExecutionContext, projectsManager: ProjectsManager) {

  val route =
    pathPrefix("projects") {
      pathEnd {
        complete(JsArray(projectsManager.allProjects.map(_.asJson)))
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
    val projectOption = projectsManager.lookupProject(projectName)
    if (projectOption.isSuccess) projectOption.get.projectInfo.asJson
    else StatusCodes.NotFound
  }

  def getModelsForProject(projectName: String, modelName: String, filter: ModelQuery) : HTTPResponse = {
    val projectOption = projectsManager.lookupProject(projectName)
    if (projectOption.isSuccess) {
      JsArray()
    } else StatusCodes.NotFound
  }

}
