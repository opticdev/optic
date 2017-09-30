package sourcegear.project

import Fixture.TestBase
import akka.actor.{Actor, Props}
import akka.testkit.{ImplicitSender, TestKit}
import better.files.File
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.actors._
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.core.sourceparsers.SourceParserManager
import com.opticdev.parsers.ParserBase
import org.scalatest.{BeforeAndAfterAll, FunSpec, FunSpecLike}

import scala.concurrent.duration._


class ProjectTest extends TestKit(actorSystem) with ImplicitSender with FunSpecLike with BeforeAndAfterAll with TestBase {

  override def afterAll {
    TestKit.shutdownActorSystem(actorSystem)
  }

  describe("Project test") {

    val sourceGear = new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.getInstalledParsers
    }

    val project = new Project("test", File(getCurrentDirectory + "/src/test/resources/tmp/test_project/"), sourceGear)

    it("can list all files recursively") {
      assert(project.watchedFiles.map(i=> i.pathAsString.split("/src/test/resources/tmp/test_project/")(1)) ==
        Vector("app.js", "nested/firstFile.js", "nested/nested/secondFile.js"))
    }

    describe("can watch files") {

      val project = new Project("test", File(getCurrentDirectory + "/src/test/resources/tmp/test_project/"), sourceGear) {
        //turn our test into the middleman to ensure project actors will get the proper messages.
        override val projectActor = self
      }

      def fileWatchTest = {
        it("detects new file creation") {
          File(getCurrentDirectory + "/src/test/resources/tmp/test_project/example.js").createIfNotExists(false)
          expectMsgAllConformingOf[FileCreated]()
        }

        it("detects file modification") {
          File(getCurrentDirectory + "/src/test/resources/tmp/test_project/app.js").write("var new = 'content'")
          expectMsgAllConformingOf[FileUpdated]()
        }

        it("detects file deletion") {
          File(getCurrentDirectory + "/src/test/resources/tmp/test_project/app.js").delete(false)
          expectMsgAllConformingOf[FileDeleted]()
        }
      }

      project.watch
      fileWatchTest

      it("can stop watching files") {
        project.stopWatching
        File(getCurrentDirectory + "/src/test/resources/tmp/test_project/otherFile.js").createIfNotExists(false)
        expectNoMsg
      }

      describe("can start watching files again") {
        project.watch
        fileWatchTest
      }

    }

  }
}
