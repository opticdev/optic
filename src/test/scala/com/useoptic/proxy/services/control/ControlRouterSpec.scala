package com.useoptic.proxy.services.control

import akka.http.scaladsl.model.{ContentTypes, StatusCodes}
import akka.http.scaladsl.testkit.ScalatestRouteTest
import com.useoptic.proxy.collection.CollectionSessionManager
import com.useoptic.proxy.services.control.collection.Protocol.StartCollection
import org.scalatest.{BeforeAndAfter, FunSpec}
import play.api.libs.json.Json


class ControlRouterSpec extends FunSpec with ScalatestRouteTest with BeforeAndAfter {

  val route = ControlRouter.routes

  before {
    CollectionSessionManager.reset
  }

  it("can start a project") {
    Post("/start").withEntity(ContentTypes.`application/json`, Json.toJson(StartCollection("Test", None)).toString()) ~> route ~> check {
      assert(status.isSuccess())
    }
  }

  it("can start a project with a forward address") {
    Post("/start").withEntity(ContentTypes.`application/json`, Json.toJson(StartCollection("Test", Some("http://localhost:20222"))).toString()) ~> route ~> check {
      assert(status.isSuccess())
      assert(CollectionSessionManager.session.forwardTo.get == "http://localhost:20222")
    }
  }

  it("will return error if collection is session") {
    CollectionSessionManager.startSession("Already Running", None)
    Post("/start").withEntity(ContentTypes.`application/json`, Json.toJson(StartCollection("Test", None)).toString()) ~> route ~> check {
      assert(status == StatusCodes.MethodNotAllowed)
    }
  }

  it("it can end a session if running") {
    CollectionSessionManager.startSession("Running", None)
    Post("/end") ~> route ~> check {
      assert(status.isSuccess())
    }
  }

}
