package com.opticdev.core.sourcegear.project

import better.files.File
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.sourcegear.{GearSet, SourceGear}
import com.opticdev.core.sourcegear.actors.{FileCreated, FileDeleted, FileUpdated}
import com.opticdev.sourcegear.actors._
import com.opticdev.core.sourcegear.graph.ProjectGraph
import com.opticdev.core.sourcegear.project.config.ProjectFile
import com.opticdev.parsers.{ParserBase, SourceParserManager}
import org.scalatest.concurrent.Eventually
import org.scalatest.time.{Millis, Seconds, Span}
import java.nio.file.{Path, WatchEvent, StandardWatchEventKinds => EventType}

import com.opticdev.core.sourcegear.project.status._
import com.opticdev.opm.{PackageManager, TestPackageProviders, TestProvider}
import org.scalatest.BeforeAndAfterAll

import scala.concurrent.duration._

class ProjectSpec extends AkkaTestFixture("ProjectTest") with GearUtils with Eventually with BeforeAndAfterAll with TestPackageProviders {

  override def beforeAll {
    resetScratch
    super.beforeAll()
  }

  override val sourceGear = new SourceGear {
    override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
    override val gearSet = new GearSet()
    override val schemas = Set()
  }


  it("can list all files recursively") {
    val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), sourceGear)
    assert(project.filesToWatch.map(i => i.pathAsString.split("test-examples/resources/tmp/test_project/")(1)) ==
      Set("app.js", "nested/firstFile.js", "nested/nested/secondFile.js"))
  }

  describe("can watch files") {

    lazy val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), sourceGear) {
      //turn our test into the middleman to ensure project actors will get the proper messages.
      override val projectActor = self
    }

    def fileWatchTest = {
      it("detects new file creation") {
        File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/example.js").createIfNotExists(false)
        expectMsgAllConformingOf[FileCreated]()
      }

      it("detects file modification") {
        File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/example.js").write("var new = 'content'")
        expectMsgAllConformingOf[FileUpdated]()
      }

      it("detects file deletion") {
        File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/example.js").delete(false)
        expectMsgAllConformingOf[FileDeleted]()
      }
    }

    project.watch
    fileWatchTest

    //@todo get these tests working again

//            it("can stop watching files") {
//              project.stopWatching
//              Thread.sleep(2000)
//              File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/otherFile.js").createIfNotExists(false)
//              expectNoMsg(2 seconds)
//            }
//
//            describe("can start watching files again") {
//              project.watch
//              fileWatchTest
//            }

  }

  it("watches for changes specifically in the project file") {

    var reached = false

    val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), sourceGear)  {
      override def projectFileChanged(pf: ProjectFile) : Unit = {
        reached = true
      }
      override def projectSourcegear: SourceGear = sourceGear
    }
    project.handleFileChange((EventType.ENTRY_MODIFY, project.projectFile.file))

    assert(reached)
  }

  it("can get the current graph") {
    val project = new StaticSGProject("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), sourceGear)
    assert(project.projectGraph.isInstanceOf[ProjectGraph])
  }

  describe("Status lifecycle") {
    //must be run in order. deliberate choice to reduce test complexity
    lazy val project = new Project("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"))
    lazy val status = project.projectStatus

    it("validates config in constructor") {

      assert(status.firstPass == NotStarted)
      assert(status.configStatus == ValidConfig)
      assert(status.monitoringStatus == NotWatching)
      assert(status.sourceGearStatus == Empty)
    }

    it("creates a sourcegear instance from config") {
      eventually (timeout(Span(5, Seconds))) {
        assert(status.sourceGearStatus == Valid)
      }
    }

    it("finishes first pass of source") {
      project.watch
      eventually (timeout(Span(15, Seconds))) {
        assert(status.firstPass == Complete)
      }

      assert(project.projectGraph.nonEmpty)
    }

  }

}
