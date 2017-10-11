package Fixture

import akka.http.scaladsl.testkit.ScalatestRouteTest
import akka.testkit.TestKit
import org.scalatest.{FunSpec, Matchers}

trait SocketTestFixture extends FunSpec with ScalatestRouteTest with Matchers {
  override def afterAll {
    TestKit.shutdownActorSystem(system)
  }
}
