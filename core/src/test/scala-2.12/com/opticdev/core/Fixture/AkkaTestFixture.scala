package com.opticdev.core.Fixture

import akka.actor.ActorSystem
import akka.testkit.{ImplicitSender, TestKit}
import com.opticdev.core.sourcegear.actors._
import org.scalatest.{BeforeAndAfterAll, FunSpecLike}

class AkkaTestFixture(mySpec: String) extends TestKit(ActorSystem(mySpec)) with ImplicitSender with FunSpecLike with BeforeAndAfterAll with TestBase {

  implicit val logToCli = false
  implicit val actorCluster = new ActorCluster(system)

  override def beforeAll: Unit = {
    PreTest.resetScratch
    start
    super.beforeAll()
  }

  override def afterAll {
    TestKit.shutdownActorSystem(system)
  }


}
