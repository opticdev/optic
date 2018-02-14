package com.opticdev.server.http.routes.socket

import akka.http.scaladsl.testkit.WSProbe
import better.files.File
import com.opticdev.core.Fixture.{SocketTestFixture, TestBase}
import com.opticdev.core.sourcegear.project.monitoring.StagedContent
import com.opticdev.server.Fixture.ProjectsManagerFixture
import com.opticdev.server.http.controllers.ContextQuery
import com.opticdev.server.http.routes.socket.editors.EditorConnection
import com.opticdev.server.http.routes.socket.editors.Protocol._
import com.opticdev.server.state.ProjectsManager
import play.api.libs.json.{JsNumber, JsObject, JsString}

import scala.concurrent.duration._
import scala.concurrent.Await

class EditorConnectionSocketSpec extends SocketTestFixture with TestBase with ProjectsManagerFixture {

  super.beforeAll()

  val future = instanceWatchingTestProject
  implicit val projectsManager = Await.result(future, 10 seconds)

  val wsClient = WSProbe()
  val editorConnectionRoute = new SocketRoute()


  WS("/socket/editor/sublime", wsClient.flow) ~> editorConnectionRoute.route ~>
    check {

      it("Connects properly") {
        assert(EditorConnection.listConnections.size == 1)
      }

      //@todo figure out a way to test this query without getting a direct response
//      describe("Can send a search query") {
//
//        it("Accepts a valid query") {
//          wsClient.sendMessage(
//            JsObject(
//              Seq("event" -> JsString("search"), "query" -> JsString("test")))
//              .toString())
//
//          wsClient.expectNoMessage()
//        }
//
//        it("Rejects invalid queries") {
//          wsClient.sendMessage(
//            JsObject(
//              Seq("event" -> JsString("search")))
//              .toString())
//
//          wsClient.expectMessage("Invalid Request")
//        }
//
//      }

      describe("Can send a context query") {

        it("Accepts a valid context query") {

          wsClient.sendMessage(
            JsObject(
              Seq("event" -> JsString("context"),
                "file" -> JsString("test-examples/resources/tmp/test_project/app.js"),
                "start" -> JsNumber(35),
                "end" -> JsNumber(37)
              ))
              .toString())
        }

        it("Rejects invalid queries") {

          wsClient.sendMessage(
            JsObject(
              Seq("event" -> JsString("context")))
              .toString())

          wsClient.expectMessage("Invalid Request")

        }
      }

      describe("Can update the Meta information") {

        it("Accepts valid updates") {
          val name = "Sublime Text"
          val version = "3"
          wsClient.sendMessage(
            JsObject(
              Seq(
                "event" -> JsString("updateMeta"),
                "name" -> JsString("Sublime Text"),
                "version" -> JsString("3")
              ))
              .toString())
          wsClient.expectMessage("Success")

          //check if it worked
          val information = EditorConnection.listConnections.head._2.information
          assert(information.name == name)
          assert(information.version == version)

        }

      }

      describe("Can send messages to client") {

        it("FileUpdate works") {
          val connection = EditorConnection.listConnections.head._2
          val event = FilesUpdated(Map(File("path/to/file") -> StagedContent("")))

          connection.sendUpdate(event)

          wsClient.expectMessage(event.asString)

        }

      }

    }
}

