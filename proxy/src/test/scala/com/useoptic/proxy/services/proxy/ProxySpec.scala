package com.useoptic.proxy.services.proxy

import akka.http.scaladsl.model.{ContentTypes, StatusCodes}
import akka.http.scaladsl.testkit.ScalatestRouteTest
import com.useoptic.proxy.{OpticAPIConfiguration, ProxyConfig}
import com.useoptic.proxy.collection.CollectionSessionManager
import com.useoptic.proxy.collection.url.TestHints
import org.scalatest.{BeforeAndAfter, BeforeAndAfterEach, FunSpec}
import play.api.libs.json.Json

import scala.util.Try


class ProxySpec extends FunSpec with ScalatestRouteTest with BeforeAndAfter with BeforeAndAfterEach {

  val route = ProxyRouter.routes

  before {
    CollectionSessionManager.startSession(
      OpticAPIConfiguration(
        "Test",
        Some(ProxyConfig("localhost", 3005)),
        Vector(TestHints.login),
        Vector(),
        Vector())
      )
  }

  override def beforeEach() {
    Try(CollectionSessionManager.session.reset)
  }

  it("returns an error if proxy is not running") {
    Post("/proxy-test").withEntity("Text Body") ~> route ~> check {
      assert(status == StatusCodes.ServiceUnavailable)
    }
  }

  describe("with proxy") {
    lazy val requiresProxy = TestProxy.start

    it("gets response from test proxy") {
      requiresProxy
      Post("/login").withEntity("Text Body") ~> route ~> check {
        assert(status.isSuccess())
        assert(CollectionSessionManager.session.log.size == 1)
      }

    }

    it("even when failure status code") {
      requiresProxy
      Post("/login").withEntity("Provide Error") ~> route ~> check {
        assert(status.isFailure())
        assert(CollectionSessionManager.session.log.size == 1)
      }
    }

  }

}
