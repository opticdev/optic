package sourcegear.actors

import Fixture.AkkaTestFixture
import Fixture.compilerUtils.GearUtils
import better.files.File
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.actors._
import com.opticdev.core.sourcegear.graph.ProjectGraphWrapper
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.parsers.SourceParserManager
import com.opticdev.parsers.ParserBase
import scala.concurrent.duration._
import com.opticdev._
class ProjectActorTest extends AkkaTestFixture("ProjectActorTest") with GearUtils {

  describe("Project Actor") {

    resetScratch

    implicit val sourceGear = new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
    }

    val importGear = gearFromDescription("src/test/resources/sdkDescriptions/ImportExample.json")
    sourceGear.gearSet.addGear(importGear)

    val project = new Project("test", File(getCurrentDirectory + "/src/test/resources/tmp/test_project/"), sourceGear)

    it("can handle a file creation") {
      project.projectActor ! FileCreated(File(getCurrentDirectory + "/src/test/resources/tmp/test_project/app.js"), project)
      expectMsgPF() {
        case i: ProjectGraphWrapper => {
          assert(i.projectGraph.size == 3)
        }
      }
    }

    it("can handle a file deletion") {
      project.projectActor ! FileDeleted(File(getCurrentDirectory + "/src/test/resources/tmp/test_project/app.js"), project)
      expectMsgPF() {
        case i: ProjectGraphWrapper => {
          assert(i.projectGraph.isEmpty)
        }
      }
    }

    it("can return the graph") {
      project.projectActor ! CurrentGraph
      expectMsgAllClassOf[ProjectGraphWrapper]()
    }

  }

}
