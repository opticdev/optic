package com.opticdev.server.routes

import akka.http.scaladsl.testkit.{ScalatestRouteTest, WSProbe}
import akka.testkit.TestKit
import com.opticdev.core.Fixture.SocketTestFixture
import com.opticdev.server.http.routes.socket.SocketRoute
import com.opticdev.server.http.routes.socket.agents.AgentConnection
import com.opticdev.server.http.routes.socket.agents.Protocol.ContextUpdate
import com.opticdev.server.state.StateManager
import org.scalatest.{FunSpec, Matchers}

class AgentConnectionRouteTest extends SocketTestFixture {

  describe("Agent connection socket system") {

    implicit val stateManager = new StateManager(Set())

    val wsClient = WSProbe()

    val editorConnectionRoute = new SocketRoute()

    WS("/socket/agent/1.0", wsClient.flow) ~> editorConnectionRoute.route ~>
      check {

        it("Connects properly") {
          assert(AgentConnection.listConnections.size == 1)
        }

        it("Broadcasts updated context to all agents") {
          val event= ContextUpdate("")
          AgentConnection.broadcastContext(event)
          wsClient.expectMessage(event.asString)
        }

      }
  }

  override def afterAll {
    TestKit.shutdownActorSystem(system)
  }
}

