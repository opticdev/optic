package sourcegear.graph

import Fixture.{AkkaTestFixture, TestBase}
import Fixture.compilerUtils.GearUtils
import better.files.File
import com.opticdev.core.sourcegear.graph.ProjectGraphWrapper
import com.opticdev.core.sourcegear.project.Project

class ProjectGraphWrapperTest extends AkkaTestFixture("ProjectGraphWrapperTest") with GearUtils {
  describe("Project Graph Wrapper") {

    it("can be initialized empty") {
      assert(ProjectGraphWrapper.empty.projectGraph.isEmpty)
    }

    implicit val project = new Project("test", File(getCurrentDirectory + "/src/test/resources/tmp/test_project/"), sourceGear)

    val testFilePath = getCurrentDirectory + "/src/test/resources/example_source/ImportSource.js"
    val file = File(testFilePath)
    val importResults = {
      val importGear = gearFromDescription("src/test/resources/sdkDescriptions/ImportExample.json")
      sourceGear.gearSet.addGear(importGear)
      sourceGear.parseFile(File(testFilePath))
    }

    it("can add models from AstGraph") {
      val projectGraphWrapper = ProjectGraphWrapper.empty

      projectGraphWrapper.addFile(importResults.get.astGraph, file)

      assert(projectGraphWrapper.projectGraph.nodes.size == 3)
      assert(projectGraphWrapper.projectGraph.edges.size == 2)
    }

    it("gets the subgraph for a file") {
      val projectGraphWrapper = ProjectGraphWrapper.empty
      projectGraphWrapper.addFile(importResults.get.astGraph, file)

      assert( projectGraphWrapper.subgraphForFile(file).get == projectGraphWrapper.projectGraph)
    }

    it("can remove file from AstGraph ") {

      val projectGraphWrapper = ProjectGraphWrapper.empty
      projectGraphWrapper.addFile(importResults.get.astGraph, file)

      projectGraphWrapper.removeFile(file)

      assert(projectGraphWrapper.projectGraph.isEmpty)

    }

  }
}
