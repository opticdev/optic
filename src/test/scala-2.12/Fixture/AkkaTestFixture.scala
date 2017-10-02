package Fixture

import akka.testkit.{ImplicitSender, TestKit}
import com.opticdev.core.sourcegear.actors._
import org.scalatest.{BeforeAndAfterAll, FunSpecLike}

class AkkaTestFixture extends TestKit(actorSystem) with ImplicitSender with FunSpecLike with BeforeAndAfterAll with TestBase {

  override def afterAll {
    TestKit.shutdownActorSystem(actorSystem)
  }


}
