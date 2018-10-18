package com.opticdev.server.http.routes

import akka.http.scaladsl.marshalling.ToResponseMarshallable
import akka.http.scaladsl.model.{StatusCode, StatusCodes}
import akka.http.scaladsl.unmarshalling.Unmarshal

import scala.concurrent.ExecutionContext
import akka.http.scaladsl.server.Directives.{path, _}
import akka.http.scaladsl.server.{Route, StandardRoute}
import better.files.File
import com.opticdev.common.storage.DataDirectory
import com.opticdev.common.{BuildInfo, SchemaRef}
import com.opticdev.core.sourcegear.project.ProjectInfo
import com.opticdev.core.sourcegear.project.status.{ImmutableProjectStatus, NotLoaded, ProjectStatus}
import com.opticdev.server.http.HTTPResponse
import com.opticdev.server.state.ProjectsManager
import play.api.libs.json._
import de.heikoseeberger.akkahttpplayjson.PlayJsonSupport._

import scala.util.Try

class ProjectRoute(implicit executionContext: ExecutionContext, projectsManager: ProjectsManager) {

  val route: Route =
    pathPrefix("projects") {
      path("lookup") {
        parameters('path) { path =>
          import com.opticdev.core.utils.FileInPath._
          val result = File(path).projectFileOption
          if (result.isDefined) {
            val pf = result.get
            val name = pf.interface.get.name.initialValue.value
            val directory = pf.file.pathAsString
            complete(ProjectInfo(name, directory).asJson)
          } else {
            complete(StatusCodes.NotFound)
          }
        }
      } ~
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
    } ~
    post {
      path("trigger-refresh") {
        //clear all cached sourcegears
        DataDirectory.sourcegear.list.foreach(_.delete(true))
        //trigger a rebuild all of active projects
        projectsManager.activeProjects.foreach(_.fullRefresh)
        complete("Done")
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
