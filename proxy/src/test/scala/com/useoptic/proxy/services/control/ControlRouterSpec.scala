package com.useoptic.proxy.services.control

import akka.http.scaladsl.model.{ContentTypes, StatusCodes}
import akka.http.scaladsl.testkit.ScalatestRouteTest
import com.useoptic.proxy.{OpticAPIConfiguration, ProxyConfig}
import com.useoptic.proxy.collection.CollectionSessionManager
import com.useoptic.proxy.services.control.collection.Protocol._
import org.scalatest.{BeforeAndAfter, FunSpec}
import play.api.libs.json.Json


class ControlRouterSpec extends FunSpec with ScalatestRouteTest with BeforeAndAfter {

  val route = ControlRouter.routes

  before {
    CollectionSessionManager.reset
  }

  val config = OpticAPIConfiguration("Test", Some(ProxyConfig("localhost", 20222)), Vector(), Vector(), Vector())

//  it("can start a project with a forward address") {
//    Post("/start").withEntity(ContentTypes.`application/json`, Json.toJson(config).toString()) ~> route ~> check {
//      assert(status.isSuccess())
//      assert(CollectionSessionManager.session.configuration.forwardTo.get.host == "localhost")
//    }
//  }

  it("will return error if collection is session") {
    CollectionSessionManager.startSession(config)
    Post("/start").withEntity(ContentTypes.`application/json`, Json.toJson(config).toString()) ~> route ~> check {
      assert(status == StatusCodes.MethodNotAllowed)
    }
  }

  it("it can end a session if running") {
    CollectionSessionManager.startSession(config)
    Post("/end") ~> route ~> check {
      assert(status.isSuccess())
    }
  }

}
