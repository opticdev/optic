package com.opticdev.server.http.routes

import akka.http.scaladsl.testkit.{ScalatestRouteTest, WSProbe}
import com.opticdev.core.Fixture.SocketTestFixture
import com.opticdev.server.http.routes.socket.SocketRoute
import com.opticdev.server.http.routes.socket.editors.Protocol._
import com.opticdev.server.http.routes.socket.editors.EditorConnection
import com.opticdev.server.state.ProjectsManager
import org.scalatest.{FunSpec, Matchers}
import play.api.libs.json.{JsNumber, JsObject, JsString}

class EditorConnectionRouteSpec extends SocketTestFixture {

  implicit val projectsManager = new ProjectsManager

  val wsClient = WSProbe()

  val editorConnectionRoute = new SocketRoute()

  WS("/socket/editor/sublime", wsClient.flow) ~> editorConnectionRoute.route ~>
    check {

      it("Connects properly") {
        assert(EditorConnection.listConnections.size == 1)
      }

      describe("Can send a search query") {

        it("Accepts a valid query") {
          wsClient.sendMessage(
            JsObject(
              Seq("event" -> JsString("search"), "query" -> JsString("test")))
              .toString())

          wsClient.expectMessage("Success")
        }

        it("Rejects invalid queries") {
          wsClient.sendMessage(
            JsObject(
              Seq("event" -> JsString("search")))
              .toString())

          wsClient.expectMessage("Invalid Request")
        }

      }

      describe("Can send a context query") {

        it("Accepts a valid context query") {

          wsClient.sendMessage(
            JsObject(
              Seq("event" -> JsString("context"),
                "file" -> JsString("the file path"),
                "start" -> JsNumber(0),
                "end" -> JsNumber(15)
              ))
              .toString())

          wsClient.expectMessage("Success")

        }

        it("Rejects invalid queries") {

          wsClient.sendMessage(
            JsObject(
              Seq("event" -> JsString("search")))
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

      describe("Can send arbitrary messages to client") {

        it("FileUpdate works") {
          val connection = EditorConnection.listConnections.head._2
          val event = FileUpdate("path/to/file", "contents")

          connection.sendUpdate(event)

          wsClient.expectMessage(event.asString)

        }

        it("RangeUpdate works") {
          val connection = EditorConnection.listConnections.head._2
          val event = RangeUpdate("path/to/file", 0, 1, "contents")

          connection.sendUpdate(event)

          wsClient.expectMessage(event.asString)

        }

      }

    }
}

