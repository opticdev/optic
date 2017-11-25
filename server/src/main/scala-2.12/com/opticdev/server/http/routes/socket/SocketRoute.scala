package com.opticdev.server.http.routes.socket

import akka.http.scaladsl.model.ws.{Message, TextMessage}
import akka.http.scaladsl.server.Directives._
import akka.stream.scaladsl.Flow
import com.opticdev.core.actorSystem
import com.opticdev.server.http.routes.socket.agents.AgentConnection
import com.opticdev.server.http.routes.socket.editors.EditorConnection
import com.opticdev.server.state.StateManager

import scala.concurrent.ExecutionContext
import scala.util.Failure

class SocketRoute(implicit executionContext: ExecutionContext, stateManager: StateManager) {
  val route = get {
    pathPrefix("socket" / "editor" / Remaining ) { editor =>
      handleWebSocketMessages(EditorConnection.websocketChatFlow(EditorConnection.findOrCreate(editor)))
    } ~
    pathPrefix("socket" / "agent" / Remaining ) { agentName =>
      handleWebSocketMessages(AgentConnection.websocketChatFlow(AgentConnection.findOrCreate(agentName)))
    }
  }
}
