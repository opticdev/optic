package sourcegear.actors

import Fixture.TestBase
import akka.actor.ActorSystem
import akka.testkit.{ImplicitSender, TestKit}
import better.files.File
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.actors._
import com.opticdev.core.sourceparsers.SourceParserManager
import com.opticdev.parsers.ParserBase
import org.scalatest.{BeforeAndAfterAll, FunSpecLike}

class ParseSupervisorActorTest extends TestKit(ActorSystem("MySpec")) with ImplicitSender with FunSpecLike with BeforeAndAfterAll with TestBase {


  override def afterAll {
    TestKit.shutdownActorSystem(system)
  }

  describe("Parse supervisor actor test") {

    implicit val sourceGear = new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.getInstalledParsers
    }

    it("can parse file") {
       parserSupervisorRef ! ParseFile(File(getCurrentDirectory+"/src/test/resources/test_project/app.js"))
       expectMsgAllConformingOf[ParseSuccessful]()
    }

    it("fails gracefully when file is unreadable") {
      parserSupervisorRef ! ParseFile(File(getCurrentDirectory+"/src/test/resources/test_project/fakeFile.js"))
      expectMsgAllConformingOf[ParseFailed]()
    }



  }

}
