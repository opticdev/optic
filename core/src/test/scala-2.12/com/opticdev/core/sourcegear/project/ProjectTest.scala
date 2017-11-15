package com.opticdev.core.sourcegear.project

import better.files.File
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.Fixture.compilerUtils.GearUtils
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.actors.{FileCreated, FileDeleted, FileUpdated}
import com.opticdev.sourcegear.actors._
import com.opticdev.core.sourcegear.graph.ProjectGraph
import com.opticdev.parsers.{ParserBase, SourceParserManager}


class ProjectTest extends AkkaTestFixture("ProjectTest") with GearUtils {

  override def beforeAll {
    resetScratch
  }

  describe("Project test") {

    val sourceGear = new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
    }

    val project = new Project("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), sourceGear)

    it("can list all files recursively") {
      assert(project.watchedFiles.map(i => i.pathAsString.split("test-examples/resources/tmp/test_project/")(1)) ==
        Set("app.js", "nested/firstFile.js", "nested/nested/secondFile.js"))
    }

    describe("can watch files") {

      val project = new Project("test", File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/"), sourceGear) {
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
      //
      //      it("can stop watching files") {
      ////        Thread.sleep(1000)
      ////        project.stopWatching
      //        File(getCurrentDirectory + "/test-examples/resources/tmp/test_project/otherFile.js").createIfNotExists(false)
      //        expectNoMsg(2 seconds)
      //      }
      //
      //      describe("can start watching files again") {
      //        project.watch
      //        fileWatchTest
      //      }

    }

    it("can get the current graph") {
      assert(project.projectGraph.isInstanceOf[ProjectGraph])
    }
  }
}
