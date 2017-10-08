package sourcegear.actors

import Fixture.{AkkaTestFixture, TestBase}
import akka.actor.ActorSystem
import akka.testkit.{ImplicitSender, TestKit}
import better.files.File
import com.opticdev.core.sourcegear.{ParseCache, SourceGear}
import com.opticdev.core.sourcegear.actors._
import com.opticdev.parsers.SourceParserManager
import com.opticdev.parsers.ParserBase
import org.scalatest.{BeforeAndAfterAll, FunSpecLike}
import akka.pattern.ask
import akka.util.Timeout
import com.opticdev.core.sourcegear.graph.FileNode
import com.opticdev.parsers.utils.Crypto

import scala.concurrent.duration._
import scala.concurrent.Await
import scalax.collection.mutable.Graph

class ParseSupervisorActorTest extends AkkaTestFixture {

  override def beforeAll {
    resetScratch
  }

  describe("Parse supervisor actor") {

    implicit val sourceGear = new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
    }

    it("can parse files") {
       parserSupervisorRef ! ParseFile(File(getCurrentDirectory+"/src/test/resources/test_project/app.js"), self)
       expectMsgAllConformingOf[ParseSuccessful]()
    }

    it("fails gracefully when file is unreadable") {
      parserSupervisorRef ! ParseFile(File(getCurrentDirectory+"/src/test/resources/test_project/fakeFile.js"), self)
      expectMsgAllConformingOf[ParseFailed]()
    }

    describe("context") {
      it("for a file can be calculated") {
        val file = File(getCurrentDirectory+"/src/test/resources/test_project/app.js")
        val fileNode = FileNode(file.pathAsString, Crypto.createSha1(file.contentAsString))
        parserSupervisorRef ! GetContext(fileNode)
      }
    }

    describe("caches") {

      val file = FileNode.fromFile(File("/src/test/resources/tmp/test_project/example"))
      val parseCache = new ParseCache
      parseCache.add(file, Graph())

      it("can be assigned") {
        parserSupervisorRef ! SetCache(parseCache)
        ParseSupervisorSyncAccess.setCache(parseCache)
        assert(ParseSupervisorSyncAccess.cacheSize == 1)
      }

      it("can be cleared") {
        parserSupervisorRef ! ClearCache
        assert(ParseSupervisorSyncAccess.cacheSize == 0)
      }

      it("can add records") {
        parserSupervisorRef ! AddToCache(file, Graph())
        assert(ParseSupervisorSyncAccess.cacheSize == 1)
      }

      it("can lookup records") {
        assert(ParseSupervisorSyncAccess.lookup(file).isDefined)
      }

    }

  }

}
