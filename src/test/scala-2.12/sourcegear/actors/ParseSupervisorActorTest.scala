package sourcegear.actors

import Fixture.{AkkaTestFixture, TestBase}
import akka.actor.{ActorSystem, Props}
import akka.testkit.{ImplicitSender, TestKit}
import better.files.File
import com.opticdev.core.sourcegear.{CacheRecord, ParseCache, SGContext, SourceGear}
import com.opticdev.core.sourcegear.actors._
import com.opticdev.parsers.SourceParserManager
import com.opticdev.parsers.ParserBase
import org.scalatest.{BeforeAndAfterAll, FunSpecLike}
import akka.pattern.ask
import akka.util.Timeout
import com.opticdev._
import com.opticdev.core.sourcegear.graph.{FileNode, ProjectGraphWrapper}
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.parsers.utils.Crypto

import scala.concurrent.duration._
import scala.concurrent.Await
import scalax.collection.mutable.Graph

class ParseSupervisorActorTest extends AkkaTestFixture("ParseSupervisorActorTest") {

  override def beforeAll {
    resetScratch
  }

  def fixture = new {
    val actorCluster = new ActorCluster(system)
  }

  describe("Parse supervisor actor") {

    implicit val sourceGear = new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
    }

    describe("context lookup") {
      val f = fixture
      implicit val logToCli = false

      implicit val project = new Project("test", File(getCurrentDirectory + "/src/test/resources/example_source/"), sourceGear) {
        override val projectActor = f.actorCluster.newProjectActor()
      }

      it("for file in cache") {
        val file = File(getCurrentDirectory+"/src/test/resources/tmp/test_project/app.js")
        f.actorCluster.parserSupervisorRef ! AddToCache(FileNode.fromFile(file), Graph(), SourceParserManager.installedParsers.head, "Contents")
        f.actorCluster.parserSupervisorRef ! GetContext(FileNode.fromFile(file))(sourceGear, project)
        expectMsg(Option(SGContext(sourceGear.fileAccumulator, Graph(), SourceParserManager.installedParsers.head, "Contents")))
      }

      it("for file not in cache") {
        val file = File(getCurrentDirectory+"/src/test/resources/tmp/test_project/app.js")
        f.actorCluster.parserSupervisorRef ! ClearCache
        f.actorCluster.parserSupervisorRef ! GetContext(FileNode.fromFile(file))(sourceGear, project)
        expectMsgPF() {
          case a: Option[SGContext] => assert(a.isDefined)
        }
      }

    }


    implicit val project = new Project("test", File(getCurrentDirectory + "/src/test/resources/example_source/"), sourceGear) {
      override val projectActor = self
    }

    it("can parse files") {
      actorCluster.parserSupervisorRef ! ParseFile(File(getCurrentDirectory+"/src/test/resources/test_project/app.js"), self, project)
      expectMsgAllConformingOf[ParseSuccessful]()
      expectMsgPF() {
        case ps: ParseSuccessful => assert(ps.parseResults.astGraph.nonEmpty)
      }
    }

    it("fails gracefully when file is unreadable") {
      actorCluster.parserSupervisorRef ! ParseFile(File(getCurrentDirectory+"/src/test/resources/test_project/fakeFile.js"), self, project)
      expectMsg(ParseFailed(File(getCurrentDirectory+"/src/test/resources/test_project/fakeFile.js")))
    }

    describe("caches") {
      val dummyRecord = CacheRecord(Graph(), null, "contents")
      val file = FileNode.fromFile(File("/src/test/resources/tmp/test_project/app.js"))
      val parseCache = new ParseCache
      parseCache.add(file, dummyRecord)

      it("can be assigned") {
        ParseSupervisorSyncAccess.setCache(parseCache)
        assert(ParseSupervisorSyncAccess.cacheSize == 1)
      }

      it("can be cleared") {
        actorCluster.parserSupervisorRef ! ClearCache
        assert(ParseSupervisorSyncAccess.cacheSize == 0)
      }

      it("can add records") {
        actorCluster.parserSupervisorRef ! ClearCache
        actorCluster.parserSupervisorRef ! AddToCache(file, Graph(), null, "contents")
        assert(ParseSupervisorSyncAccess.cacheSize == 1)
      }

      it("can lookup records") {
        assert(ParseSupervisorSyncAccess.lookup(file).isDefined)
      }

    }

  }

}
