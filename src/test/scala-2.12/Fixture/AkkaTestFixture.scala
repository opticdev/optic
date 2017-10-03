package Fixture

import akka.actor.ActorSystem
import akka.testkit.{ImplicitSender, TestKit}
import com.opticdev.core.sourcegear.actors._
import org.scalatest.{BeforeAndAfterAll, FunSpecLike}

class AkkaTestFixture extends TestKit(ActorSystem("test")) with ImplicitSender with FunSpecLike with BeforeAndAfterAll with TestBase {

  override def beforeAll: Unit = {
    PreTest.resetScratch
  }

  override def afterAll {
    TestKit.shutdownActorSystem(ActorSystem("test"))
  }


}
