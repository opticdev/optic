package com.opticdev.server.http.routes.socket

import akka.http.scaladsl.testkit.WSProbe
import akka.testkit.TestKit
import com.opticdev.core.Fixture.SocketTestFixture
import com.opticdev.server.http.routes.socket.agents.AgentConnection
import com.opticdev.server.http.routes.socket.agents.Protocol
import com.opticdev.server.http.routes.socket.agents.Protocol.{ContextFound, PutUpdate}
import com.opticdev.server.state.ProjectsManager
import play.api.libs.json.{JsArray, JsObject, JsString}

class AgentConnectionSocketSpec extends SocketTestFixture {

  implicit val projectsManager = new ProjectsManager()

  val wsClient = WSProbe()

  val socketRoute = new SocketRoute()

  WS("/socket/agent/optic-agent", wsClient.flow) ~> socketRoute.route ~>
    check {

      it("Connects properly") {
        assert(AgentConnection.listConnections.size == 1)
      }

      it("Can send a put update request") {
        val event= PutUpdate("Id", JsObject.empty, "test", "Unnamed Project")
        val asString = JsObject(Seq("id" -> JsString(event.id), "newValue" -> event.newValue)).toString
        wsClient.sendMessage(asString)
      }

//      it("Broadcasts updated context to all agents") {
//        val event= ContextFound("f/i/l/e", Range(0,1), JsArray.empty)
//        AgentConnection.broadcastUpdate(event)
//        wsClient.expectMessage(event.asString)
//      }

    }
}

