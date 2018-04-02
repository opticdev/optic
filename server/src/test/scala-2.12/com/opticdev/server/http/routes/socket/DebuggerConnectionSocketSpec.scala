package com.opticdev.server.http.routes.socket

import akka.http.scaladsl.testkit.WSProbe
import com.opticdev.core.Fixture.SocketTestFixture
import com.opticdev.server.http.routes.socket.debuggers.DebuggerConnection
import com.opticdev.server.state.ProjectsManager
import play.api.libs.json.{JsObject, JsString}

class DebuggerConnectionSocketSpec extends SocketTestFixture {

  implicit val projectsManager = new ProjectsManager()

  val wsClient = WSProbe()

  val socketRoute = new SocketRoute()

  WS("/socket/debugger/optic-debugger", wsClient.flow) ~> socketRoute.route ~>
    check {

      it("Connects properly") {
        assert(DebuggerConnection.listConnections.size == 1)
        assert(DebuggerConnection.hasConnection)
      }
    }
}

