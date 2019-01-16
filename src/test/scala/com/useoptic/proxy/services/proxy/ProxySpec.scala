package com.useoptic.proxy.services.proxy

import akka.http.scaladsl.model.{ContentTypes, StatusCodes}
import akka.http.scaladsl.testkit.ScalatestRouteTest
import com.useoptic.proxy.collection.CollectionSessionManager
import com.useoptic.proxy.services.control.collection.Protocol.StartCollection
import org.scalatest.{BeforeAndAfter, FunSpec}
import play.api.libs.json.Json


class ProxySpec extends FunSpec with ScalatestRouteTest with BeforeAndAfter {

  val route = ProxyRouter.routes


  before {
    CollectionSessionManager.reset
  }

  it("returns an error if proxy is not running") {
    Post("/proxy-test").withEntity("Text Body") ~> route ~> check {
      println(response)
      assert(status == StatusCodes.ServiceUnavailable)
    }
  }

  describe("with proxy") {

    lazy val requiresProxy = TestProxy.start

    it("gets response from test proxy") {
      requiresProxy
      Post("/proxy-test").withEntity("Text Body") ~> route ~> check {
        assert(status.isSuccess())
      }
    }

    it("even when failure status code") {
      requiresProxy
      Post("/proxy-test").withEntity("Provide Error") ~> route ~> check {
        assert(status.isFailure())
      }
    }

  }

}
