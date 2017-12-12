package com.opticdev.server.http.routes.socket

import akka.http.scaladsl.model.headers.HttpOriginRange
import akka.http.scaladsl.model.ws.{Message, TextMessage}
import akka.http.scaladsl.server.Directives._
import akka.stream.scaladsl.Flow
import com.opticdev.core.actorSystem
import com.opticdev.server.http.routes.socket.agents.AgentConnection
import com.opticdev.server.http.routes.socket.editors.EditorConnection
import com.opticdev.server.state.ProjectsManager

import scala.concurrent.ExecutionContext
import scala.util.Failure
import ch.megard.akka.http.cors.scaladsl.CorsDirectives._
import ch.megard.akka.http.cors.scaladsl.settings.CorsSettings

class SocketRoute(implicit executionContext: ExecutionContext, projectsManager: ProjectsManager) {

  val settings: CorsSettings.Default = CorsSettings.defaultSettings.copy()

  val route = cors(settings)  {
    get {
      pathPrefix("socket" / "editor" / Remaining) { editorName =>
        handleWebSocketMessages(EditorConnection.websocketChatFlow(EditorConnection.findOrCreate(editorName)))
      } ~
      pathPrefix("socket" / "agent" / Remaining) { agentName =>
        handleWebSocketMessages(AgentConnection.websocketChatFlow(AgentConnection.findOrCreate(agentName)))
      }
    }
  }
}
