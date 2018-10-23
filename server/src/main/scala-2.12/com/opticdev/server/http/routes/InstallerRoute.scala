package com.opticdev.server.http.routes

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives.{path, _}
import akka.http.scaladsl.server.Route
import better.files.File
import com.opticdev.common.storage.DataDirectory
import com.opticdev.common.{BuildInfo, SchemaRef}
import com.opticdev.core.sourcegear.project.ProjectInfo
import com.opticdev.installer.IDEInstaller
import com.opticdev.server.http.HTTPResponse
import com.opticdev.server.state.ProjectsManager
import de.heikoseeberger.akkahttpplayjson.PlayJsonSupport._
import play.api.libs.json._

import scala.concurrent.{ExecutionContext, Future}
import scala.util.Try

class InstallerRoute(implicit executionContext: ExecutionContext, projectsManager: ProjectsManager) {

  val route: Route =
    pathPrefix("installer") {
      path("ide-plugins") {
        get {
          complete(JsArray(IDEInstaller.findInstalledIDEs.keys.toSeq.sorted.map(JsString)))
        } ~
          post {
            parameters('install) { installArray =>
              val install = installArray.split(",")
              val installResults = IDEInstaller.installIDEs(install:_*)
              complete(JsObject(installResults.map((i) => i._1 -> JsBoolean(i._2))))
            }
          }
      }
    }
}
