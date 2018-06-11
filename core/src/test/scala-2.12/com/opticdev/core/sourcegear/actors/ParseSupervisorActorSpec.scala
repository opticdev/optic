package com.opticdev.sourcegear.actors

import better.files.File
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.sourcegear.graph.FileNode
import com.opticdev.core.sourcegear.project.{Project, StaticSGProject}
import com.opticdev.core.sourcegear._
import com.opticdev.parsers.{ParserBase, SourceParserManager}
import com.opticdev.core.actorSystem
import com.opticdev.core.sourcegear.actors._
import com.opticdev.core.sourcegear.context.FlatContext
import scalax.collection.mutable.Graph

class ParseSupervisorActorSpec extends AkkaTestFixture("ParseSupervisorActorTest") {

  def fixture = new {
    val actorCluster = new ActorCluster(system)
  }

  implicit val sourceGear = new SourceGear {
    override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
    override val lensSet = new LensSet()
    override val schemas = Set()
    override val transformations = Set()
    override val flatContext: FlatContext = FlatContext(None, Map.empty)
  }

  describe("context lookup") {
    val f = fixture
    implicit val logToCli = false

    implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/example_source/"), sourceGear) {
      override val projectActor = f.actorCluster.newProjectActor()(false, this)
    }

    it("for file in cache") {
      val file = File(getCurrentDirectory+"/test-examples/resources/tmp/test_project/app.js")
      f.actorCluster.parserSupervisorRef ! AddToCache(file, Graph(), SourceParserManager.installedParsers.head, "Contents", None)
      f.actorCluster.parserSupervisorRef ! GetContext(file)(sourceGear, project)
      expectMsg(Option(SGContext(sourceGear.fileAccumulator, Graph(), SourceParserManager.installedParsers.head, "Contents", null, file)))
    }

    it("for file not in cache") {
      val file = File(getCurrentDirectory+"/test-examples/resources/tmp/test_project/app.js")
      f.actorCluster.parserSupervisorRef ! ClearCache
      f.actorCluster.parserSupervisorRef ! GetContext(file)(sourceGear, project)
      expectMsgPF() {
        case a: Option[SGContext] => {
          println(a)
          assert(a.isDefined)
        }
      }
    }

  }

  implicit val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/example_source/"), sourceGear) {
    override val projectActor = self
  }

  it("can parse files") {
    val f = fixture
    f.actorCluster.parserSupervisorRef ! ParseFile(File(getCurrentDirectory+"/test-examples/resources/test_project/app.js"), self, project)
    expectMsgAllConformingOf[ParseSuccessful]()
    expectMsgPF() {
      case ps: ParseSuccessful => assert(ps.parseResults.astGraph.nonEmpty)
    }
  }

  it("can parse files with explicit contents passed") {
    val f = fixture
    f.actorCluster.parserSupervisorRef ! ParseFileWithContents(File(getCurrentDirectory+"/test-examples/resources/test_project/app.js"), "var me = you", self, project)
    expectMsgAllConformingOf[ParseSuccessful]()
    expectMsgPF() {
      case ps: ParseSuccessful => assert(ps.parseResults.astGraph.nonEmpty)
    }
  }

  it("fails gracefully when file is unreadable") {
    val f = fixture
    f.actorCluster.parserSupervisorRef ! ParseFile(File(getCurrentDirectory+"/test-examples/resources/test_project/fakeFile.js"), self, project)
    expectMsg(ParseFailed(File(getCurrentDirectory+"/test-examples/resources/test_project/fakeFile.js")))
  }

  describe("caches") {
    val f = fixture
    val dummyRecord = CacheRecord(Graph(), null, "contents", None)
    val file = File("/test-examples/resources/tmp/test_project/app.js")
    val parseCache = new ParseCache
    parseCache.add(file, dummyRecord)

    it("can be assigned") {
      ParseSupervisorSyncAccess.setCache(parseCache)
      assert(ParseSupervisorSyncAccess.cacheSize == 1)
    }

    it("can be cleared") {
      f.actorCluster.parserSupervisorRef ! ClearCache
      assert(ParseSupervisorSyncAccess.cacheSize()(f.actorCluster) == 0)
    }

    it("can add records") {
      f.actorCluster.parserSupervisorRef ! ClearCache
      f.actorCluster.parserSupervisorRef ! AddToCache(file, Graph(), null, "contents", None)
      assert(ParseSupervisorSyncAccess.cacheSize()(f.actorCluster) == 1)
    }

    it("can lookup records") {
      assert(ParseSupervisorSyncAccess.lookup(file)(f.actorCluster).isDefined)
    }

  }

  describe("faddish routing and mailbox") {
    it("will not parse intermediate jobs") {
      val f = fixture
      val lotsOfWastefulJobs = (0 to 50).map(i=> {
        ParseFileWithContents(File(getCurrentDirectory+"/test-examples/resources/test_project/app.js"), s"var me = ${i}", self, project)
      })

      lotsOfWastefulJobs.foreach(j=> f.actorCluster.parserSupervisorRef ! j)

      expectMsgPF() {
        case ps: ParseSuccessful => assert(ps.parseResults.fileContents == s"var me = 0")
      }

      expectMsgPF() {
        case ps: ParseSuccessful => assert(ps.parseResults.fileContents == s"var me = 50")
      }

    }
  }

}
