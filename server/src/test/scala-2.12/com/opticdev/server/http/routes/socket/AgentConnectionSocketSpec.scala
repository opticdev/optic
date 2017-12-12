package com.opticdev.server.http.routes.socket

import akka.http.scaladsl.testkit.WSProbe
import akka.testkit.TestKit
import com.opticdev.core.Fixture.SocketTestFixture
import com.opticdev.server.http.routes.socket.agents.AgentConnection
import com.opticdev.server.http.routes.socket.agents.Protocol
import com.opticdev.server.state.ProjectsManager
import play.api.libs.json.JsArray

class AgentConnectionSocketSpec extends SocketTestFixture {

  implicit val projectsManager = new ProjectsManager()

  val wsClient = WSProbe()

  val editorConnectionRoute = new SocketRoute()

  WS("/socket/agent/1.0", wsClient.flow) ~> editorConnectionRoute.route ~>
    check {

      it("Connects properly") {
        assert(AgentConnection.listConnections.size == 1)
      }

      Thread.sleep(2000)

      it("Broadcasts updated context to all agents") {
        val event= ContextFound("f/i/l/e", Range(0,1), JsArray.empty)
        AgentConnection.broadcastContext(event)
        wsClient.expectMessage(event.asString)
      }

    }
}

