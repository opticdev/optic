package com.opticdev.server.http.routes

import akka.http.scaladsl.marshalling.ToResponseMarshallable
import akka.http.scaladsl.model.{StatusCode, StatusCodes}
import akka.http.scaladsl.unmarshalling.Unmarshal

import scala.concurrent.ExecutionContext
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.{Route, StandardRoute}
import com.opticdev.sdk.descriptions.SchemaRef
import com.opticdev.server.http.HTTPResponse
import com.opticdev.server.http.routes.query.ModelQuery
import com.opticdev.server.state.ProjectsManager
import play.api.libs.json.{JsArray, JsValue}
import de.heikoseeberger.akkahttpplayjson.PlayJsonSupport._

import scala.util.Try

class ProjectRoute(implicit executionContext: ExecutionContext, projectsManager: ProjectsManager) {

  val route: Route =
    pathPrefix("projects") {
      pathEnd {
        complete(JsArray(projectsManager.allProjects.map(_.asJson)))
      } ~
        path(Segment) { projectName => complete(getProject(projectName)) } ~
        path(Segment / "schemas" / Segment) {
          (projectName, id) => {
            complete(getSchema(projectName, SchemaRef.fromString(id).getOrElse(SchemaRef.empty)))
          }
        } ~
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

  def getSchema(projectName: String, schemaRef: SchemaRef) : HTTPResponse = {
    val schemaOption = projectsManager.lookupProject(projectName)
      .flatMap(i=> Try(i.projectSourcegear.schemas.find(_.schemaRef == schemaRef).get))

    if (schemaOption.isSuccess) {
      schemaOption.get.definition
    } else {
      StatusCodes.NotFound
    }
  }

  def getModelsForProject(projectName: String, modelName: String, filter: ModelQuery) : HTTPResponse = {
    val projectOption = projectsManager.lookupProject(projectName)
    if (projectOption.isSuccess) {
      JsArray()
    } else StatusCodes.NotFound
  }

}
