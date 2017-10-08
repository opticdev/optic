package server.state

import Fixture.AkkaTestFixture
import better.files.File
import com.opticdev.core.sourcegear.SourceGear
import com.opticdev.core.sourcegear.project.Project
import com.opticdev.parsers.{ParserBase, SourceParserManager}
import com.opticdev.server.http.state.StateManager
import org.scalatest.FunSpec

class StateManagerTest extends AkkaTestFixture("StateManagerTest") {
  describe("State Manager") {

    implicit val sourceGear = new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
    }

    val initialProjects = Set(
      new Project("A", File("src/test")),
      new Project("B", File("src/main"))
    )

    it("can set an initial state") {
      val stateManager = new StateManager(initialProjects)
      assert(stateManager.allProjects == initialProjects)
    }

    describe("projects") {
      val stateManager = new StateManager()
      val target = initialProjects.head

      it("can add") {
        stateManager.addProject(target)
        assert(stateManager.allProjects.size == 1)
      }

      it("can remove") {
        stateManager.removeProject(target)
        assert(stateManager.allProjects.isEmpty)
      }

    }

    it("picks the right project for a file") {
      val stateManager = new StateManager(initialProjects)
      assert(stateManager.projectForFile(File("src/test/scala")).get.name == "A")
      assert(stateManager.projectForFile(File("src/main/scala")).get.name == "B")
    }


  }
}
