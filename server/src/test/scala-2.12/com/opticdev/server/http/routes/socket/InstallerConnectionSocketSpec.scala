package com.opticdev.server.http.routes.socket

import java.util.concurrent.TimeUnit

import akka.http.scaladsl.testkit.{RouteTestTimeout, WSProbe}
import com.opticdev.core.Fixture.{SocketTestFixture, TestBase}
import com.opticdev.installer.IDEInstaller
import com.opticdev.server.Fixture.ProjectsManagerFixture
import com.opticdev.server.http.routes.installer.InstallerConnection
import com.opticdev.server.http.routes.installer.installer.Protocol.{FoundIDEs, InstalledIDEs}
import com.opticdev.server.http.routes.socket.agents.AgentConnection
import com.opticdev.server.http.routes.socket.editors.EditorConnection
import com.opticdev.server.state.ProjectsManager
import org.scalatest.FunSpec
import play.api.libs.json.{JsArray, JsObject, JsString}

import scala.concurrent.duration._
import scala.concurrent.duration._
import scala.concurrent.Await

class InstallerConnectionSocketSpec extends SocketTestFixture with TestBase {

  super.beforeAll()

  def fixture = new {
    implicit val projectsManager = new ProjectsManager()
    val wsClient = WSProbe()
    val socketRoute = new SocketRoute()
  }

  describe("Installer Socket") {

    val f = fixture

    WS("/socket/installer/builtin", f.wsClient.flow) ~> f.socketRoute.route ~>
      check {


        it("connects properly and receives found IDEs") {
          assert(InstallerConnection.listConnections.size == 1)
          f.wsClient.expectMessage(FoundIDEs(IDEInstaller.findInstalledIDEs.keys.toSeq.sorted).asJson.toString)
        }

        it("can request install for IDEs") {
          f.wsClient.sendMessage(
            JsObject(
              Seq("event" -> JsString("install-ide-plugins"), "skip" -> JsArray(Seq(JsString("IntelliJ"), JsString("WebStorm"))))
            ).toString())

          f.wsClient.expectMessage("""{"event":"installed-ides","results":{"VSCode":true,"Atom":true,"Sublime Text 3":true,"IntelliJ CE":true}}""")

        }

      }

  }

}
