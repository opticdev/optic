package sourcegear.actors

import Fixture.{AkkaTestFixture, TestBase}
import akka.actor.ActorSystem
import akka.testkit.{ImplicitSender, TestKit}
import better.files.File
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.actors._
import com.opticdev.parsers.SourceParserManager
import com.opticdev.parsers.ParserBase
import org.scalatest.{BeforeAndAfterAll, FunSpecLike}

class ParseSupervisorActorTest extends AkkaTestFixture {

  override def beforeAll {
    resetScratch
  }

  describe("Parse supervisor actor test") {

    implicit val sourceGear = new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
    }

    it("can parse file") {
       parserSupervisorRef ! ParseFile(File(getCurrentDirectory+"/src/test/resources/test_project/app.js"), self)
       expectMsgAllConformingOf[ParseSuccessful]()
    }

    it("fails gracefully when file is unreadable") {
      parserSupervisorRef ! ParseFile(File(getCurrentDirectory+"/src/test/resources/test_project/fakeFile.js"), self)
      expectMsgAllConformingOf[ParseFailed]()
    }



  }

}
