package com.opticdev.server.http.routes

import akka.http.scaladsl.marshalling.ToResponseMarshallable
import akka.http.scaladsl.model.{StatusCode, StatusCodes}
import akka.http.scaladsl.unmarshalling.Unmarshal

import scala.concurrent.ExecutionContext
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.{Route, StandardRoute}
import com.opticdev.common.{BuildInfo, SchemaRef}
import com.opticdev.server.http.HTTPResponse
import com.opticdev.server.state.ProjectsManager
import play.api.libs.json._
import de.heikoseeberger.akkahttpplayjson.PlayJsonSupport._

import scala.util.Try

class ProjectRoute(implicit executionContext: ExecutionContext, projectsManager: ProjectsManager) {

  val route: Route =
    pathPrefix("projects") {
      pathEnd {
        complete(JsArray(projectsManager.allProjects.map(_.asJson)))
      } ~
        path(Segment) { projectName => complete(getProject(projectName)) } ~
        path(Segment / "publish") { projectName => complete(publishProject(projectName)) } ~
        path(Segment / "schemas" / Segment) {
          (projectName, id) => {
            complete(getSchema(projectName, SchemaRef.fromString(id).getOrElse(SchemaRef.empty)))
        }
      } ~
      path(Segment / "knowledge-graph") {
        (projectName) => {
          complete(getKnowledgeGraph(projectName))
        }
      }
    } ~
    path("sdk-version") {
      get {
        parameters('v) { (sdkVersion) => {
          complete(JsObject(Seq(
            "opticVersion" -> JsString(BuildInfo.currentOpticVersion),
            "isSupported" -> JsBoolean(BuildInfo.supportedSdks.contains(sdkVersion)),
            "supportedSdks" -> JsArray(BuildInfo.supportedSdks.map(JsString))
          )))
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

  def publishProject(projectName: String) : HTTPResponse = {
    val projectOption = projectsManager.lookupProject(projectName)
    if (projectOption.isSuccess) {
      projectOption.get.publishProjectGraph
      projectsManager.activeProjects.foreach{
        case project if project.projectFile.connectedProjects.contains(projectName) => project.fullRefresh
      }
      StatusCodes.OK

    } else StatusCodes.NotFound
  }

  def getKnowledgeGraph(projectName: String) : HTTPResponse = {

    val projectArrowGraph = projectsManager.lookupArrow(projectName)
      .map(i=> i.knowledgeGraphAsJson)

    if (projectArrowGraph.isDefined) {
      projectArrowGraph.get
    } else {
      StatusCodes.NotFound
    }

  }

}
