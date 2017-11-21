package com.opticdev.server.state

import better.files.File
import com.opticdev.core.Fixture.AkkaTestFixture
import com.opticdev.core.sourcegear.{GearSet, SourceGear}
import com.opticdev.core.sourcegear.project.{OpticProject, Project, StaticSGProject}
import com.opticdev.opm.OpticPackage
import com.opticdev.parsers.{ParserBase, SourceParserManager}
import com.opticdev.server.http.state.StateManager
import org.scalatest.FunSpec

class StateManagerTest extends AkkaTestFixture("StateManagerTest") {
  describe("State Manager") {

    implicit val sourceGear = new SourceGear {
      override val parsers: Set[ParserBase] = SourceParserManager.installedParsers
      override val gearSet = new GearSet()
      override val schemas = Set()
    }

    val initialProjects: Set[OpticProject] = Set(
      new StaticSGProject("A", File("test-examples/resources/test_project"), sourceGear),
      new StaticSGProject("B", File("test-examples/resources/example_source"), sourceGear)
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
      assert(stateManager.projectForFile(File("test-examples/resources/test_project")).get.name == "A")
      assert(stateManager.projectForFile(File("test-examples/resources/example_source")).get.name == "B")
    }


  }
}
