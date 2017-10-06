package sourcegear.project

import Fixture.compilerUtils.GearUtils
import Fixture.{AkkaTestFixture, TestBase}
import akka.actor.{Actor, Props}
import akka.testkit.{ImplicitSender, TestKit}
import better.files.File
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.actors._
import com.opticdev.core.sourcegear.graph.model.{LinkedModelNode, ModelNode}
import com.opticdev.core.sourcegear.graph.{AstProjection, ProjectGraph}
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.parsers.SourceParserManager
import com.opticdev.parsers.ParserBase
import org.scalatest.{BeforeAndAfterAll, FunSpec, FunSpecLike}
import play.api.libs.json.{JsObject, JsString}
import scratch.ProjectMonitoringScratch._

import scala.concurrent.duration._


class ProjectTest extends AkkaTestFixture with GearUtils {

  override def beforeAll {
    resetScratch
  }

  describe("Project test") {

    val sourceGear = new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
    }

    val project = new Project("test", File(getCurrentDirectory + "/src/test/resources/tmp/test_project/"), sourceGear)

    it("can list all files recursively") {
      assert(project.watchedFiles.map(i=> i.pathAsString.split("/src/test/resources/tmp/test_project/")(1)) ==
        Set("app.js", "nested/firstFile.js", "nested/nested/secondFile.js"))
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
          File(getCurrentDirectory + "/src/test/resources/tmp/test_project/example.js").write("var new = 'content'")
          expectMsgAllConformingOf[FileUpdated]()
        }

        it("detects file deletion") {
          File(getCurrentDirectory + "/src/test/resources/tmp/test_project/example.js").delete(false)
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
//        File(getCurrentDirectory + "/src/test/resources/tmp/test_project/otherFile.js").createIfNotExists(false)
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

    describe("updates a record") {

      val sourceGear = new SourceGear {
        override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
      }

      val importGear = gearFromDescription("src/test/resources/sdkDescriptions/ImportExample.json")
      sourceGear.gearSet.addGear(importGear)

      val project = new Project("test", File(getCurrentDirectory + "/src/test/resources/tmp/test_project/"), sourceGear)

      project.watch


      it("by unique id") {

        println(project.projectGraph)

        val option = project.projectGraph.nodes.toVector.find(_.value.asInstanceOf[ModelNode].value ==
          JsObject(Seq("definedAs" -> JsString("first"), "pathTo" -> JsString("second"))))

        println(option)

      }

    }

  }
}
