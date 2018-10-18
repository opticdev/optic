package com.opticdev.server.http.routes.socket

import akka.http.scaladsl.model.{StatusCode, StatusCodes}
import akka.http.scaladsl.model.headers.HttpOriginRange
import akka.http.scaladsl.model.ws.{Message, TextMessage}
import akka.http.scaladsl.server.Directives._
import akka.stream.scaladsl.Flow
import better.files.File
import com.opticdev.core.actorSystem
import com.opticdev.server.http.routes.socket.agents.AgentConnection
import com.opticdev.server.http.routes.socket.editors.EditorConnection
import com.opticdev.server.state.ProjectsManager
import akka.pattern.after
import scala.concurrent.{ExecutionContext, Future}
import scala.util.Failure
import scala.concurrent.duration._
import ch.megard.akka.http.cors.scaladsl.CorsDirectives._
import ch.megard.akka.http.cors.scaladsl.settings.CorsSettings
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.core.sourcegear.project.status.NotLoaded

class SocketRoute(implicit executionContext: ExecutionContext, projectsManager: ProjectsManager) {

  val settings: CorsSettings.Default = CorsSettings.defaultSettings.copy()

  val route = cors(settings)  {
    get {
        pathPrefix("socket" / "editor" / Remaining) { editorName =>
          parameters('autorefreshes.as[Boolean].?) { (autorefreshes) => {
            val options = EditorSocketRouteOptions(autorefreshes.getOrElse(false))
            handleWebSocketMessages(EditorConnection.websocketChatFlow(EditorConnection.findOrCreate(editorName, options)))
          }
          }
        } ~
        pathPrefix("socket" / "agent" / Remaining) { projectDirectoryEncoded =>

          val projectDirectory = java.net.URLDecoder.decode(projectDirectoryEncoded, "UTF-8")

          val couldLoadProject = projectsManager.lookupProject(File(projectDirectory))

          if (couldLoadProject.isSuccess) {
            handleWebSocketMessages(AgentConnection.websocketChatFlow(AgentConnection.findOrCreate(projectDirectory, AgentSocketRouteOptions())))
          } else {
            complete(StatusCodes.NotFound)
          }
        }
      }
   }
}
